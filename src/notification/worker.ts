import config from '../config.js';
import { db } from '../db/index.js';
import logger from '../utils/logger.js';
import { Outbox, OutboxStatusType } from '../types/db-generated-types.js';
import { MailTransportError, getMailTransport } from './transport/index.js';
import { renderEmail } from './templates/render.js';
import { NotificationData, NotificationType, isNotificationType } from './types.js';

/**
 * Outbox drain loop: claims pending rows, renders, sends, marks sent/failed.
 * Runs in-process; extracting it into its own process later is a deploy change,
 * not a rewrite. Uses a chained `setTimeout` so batches never overlap.
 */

/** A claim older than this is assumed to belong to a dead worker. */
const CLAIM_STALE_AFTER_MINUTES = 5;
const BACKOFF_BASE_MS = 30_000; // 30 seconds
const BACKOFF_CAP_MS = 60 * 60 * 1000; // 1 hour

/** Tuning. Keep batches small to stay inside the provider's rate limit. */
const POLL_INTERVAL_MS = 5000; // 5 seconds
const BATCH_SIZE = 25;
const MAX_ATTEMPTS = 5;

type ClaimedRow = Outbox & {
  type_code: string;
  recipient: string;
  language_code: string | null;
};

type WorkerHandle = {
  stop: () => Promise<void>;
};

/** Exponential backoff with jitter, so a recovered outage does not stampede. */
function backoffMs(attempts: number): number {
  const base = Math.min(BACKOFF_BASE_MS * 2 ** Math.max(0, attempts - 1), BACKOFF_CAP_MS);

  return Math.round(base * (0.75 + Math.random() * 0.5));
}

/** Releases rows stuck in `processing` (worker died between claim and write-back). */
async function reclaimStaleClaims(): Promise<void> {
  await db('outbox')
    .where('status', OutboxStatusType.Processing)
    .where('locked_at', '<', db.raw(`now() - interval '${CLAIM_STALE_AFTER_MINUTES} minutes'`))
    .update({ status: OutboxStatusType.Pending, locked_at: null });
}

/**
 * Claims a batch atomically so several workers never claim the same row.
 * The select and the update must be ONE statement: two statements would let the
 * select's locks drop early and a second worker would mail the same person twice.
 */
async function claimBatch(limit: number): Promise<ClaimedRow[]> {
  const claimable = db('outbox')
    .select('id')
    .where('status', OutboxStatusType.Pending)
    .where('available_at', '<=', db.fn.now())
    .orderBy([
      { column: 'available_at', order: 'asc' },
      { column: 'id', order: 'asc' },
    ])
    .limit(limit)
    .forUpdate()
    .skipLocked();

  const claimed = await db('outbox')
    .whereIn('id', claimable)
    .update({
      status: OutboxStatusType.Processing,
      locked_at: db.fn.now(),
      attempts: db.raw('attempts + 1'),
      updated_at: db.fn.now(),
    })
    .returning<{ id: number }[]>('id');

  if (claimed.length === 0) {
    return [];
  }

  const ids = claimed.map((row) => row.id);

  return db('outbox')
    .select(
      'outbox.*',
      'notification_type.code as type_code',
      'account.email as recipient',
      'language.code as language_code',
    )
    .join('account', 'account.id', 'outbox.account_id')
    .join('notification_type', 'notification_type.id', 'outbox.type_id')
    .leftJoin('language', 'language.id', 'account.preferred_language_id')
    .whereIn('outbox.id', ids);
}

async function markFailed(row: ClaimedRow, message: string): Promise<void> {
  await db('outbox')
    .where('id', row.id)
    .update({
      status: OutboxStatusType.Failed,
      locked_at: null,
      last_error: message.slice(0, 2000),
      updated_at: db.fn.now(),
    });

  logger.error(
    { outboxId: row.id, type: row.type_code, attempts: row.attempts, reason: message },
    'mail: giving up on outbox row',
  );
}

async function deliver(row: ClaimedRow): Promise<void> {
  if (!isNotificationType(row.type_code)) {
    await markFailed(row, `Unknown notification type "${row.type_code}".`);
    return;
  }

  if (!row.recipient) {
    await markFailed(row, 'Recipient account has no email address.');
    return;
  }

  const type = row.type_code as NotificationType;
  const transport = getMailTransport();

  try {
    // Rendering is inside the try: a bad payload is a code bug and must fail
    // the row instead of retrying five times.
    const email = renderEmail(
      type,
      row.payload as NotificationData<NotificationType>,
      row.language_code,
    );

    const result = await transport.send({
      to: row.recipient,
      from: config.MAIL_FROM,
      subject: email.subject,
      html: email.html,
      text: email.text,
      // Keyed by row id, so a retry is a retry and not a second email.
      idempotencyKey: `outbox/${row.id}`,
      tags: { notification_type: type },
    });

    await db('outbox').where('id', row.id).update({
      status: OutboxStatusType.Sent,
      sent_at: db.fn.now(),
      locked_at: null,
      recipient: row.recipient,
      subject: email.subject,
      provider: transport.key,
      provider_message_id: result.providerMessageId,
      last_error: null,
      updated_at: db.fn.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const retryable = !(error instanceof MailTransportError) || error.retryable;

    if (retryable && row.attempts < MAX_ATTEMPTS) {
      await db('outbox')
        .where('id', row.id)
        .update({
          status: OutboxStatusType.Pending,
          available_at: new Date(Date.now() + backoffMs(row.attempts)),
          locked_at: null,
          last_error: message.slice(0, 2000),
          updated_at: db.fn.now(),
        });

      logger.warn(
        { outboxId: row.id, type: row.type_code, attempts: row.attempts, reason: message },
        'mail: send failed, will retry',
      );
      return;
    }

    await markFailed(row, message);
  }
}

async function runOnce(): Promise<number> {
  await reclaimStaleClaims();

  const rows = await claimBatch(BATCH_SIZE);

  if (rows.length === 0) {
    return 0;
  }

  // Sequential: at one small batch per tick this stays inside the rate limit.
  for (const row of rows) {
    try {
      await deliver(row);
    } catch (error) {
      logger.error({ err: error, outboxId: row.id }, 'mail: unexpected worker error');
    }
  }

  return rows.length;
}

export function startMailWorker(): WorkerHandle {
  let stopped = false;
  let inFlight: Promise<unknown> = Promise.resolve();
  let timer: NodeJS.Timeout | null = null;

  const schedule = () => {
    if (stopped) {
      return;
    }

    timer = setTimeout(() => {
      inFlight = runOnce()
        .then((processed) => {
          if (processed > 0) {
            logger.info({ processed }, 'mail: outbox batch drained');
          }
        })
        .catch((error: unknown) => {
          logger.error({ err: error }, 'mail: worker tick failed');
        })
        .finally(schedule);
    }, POLL_INTERVAL_MS);

    timer.unref();
  };

  schedule();

  logger.info({ pollMs: POLL_INTERVAL_MS }, 'mail: outbox worker started');

  return {
    async stop() {
      stopped = true;

      if (timer) {
        clearTimeout(timer);
      }

      await inFlight;
    },
  };
}
