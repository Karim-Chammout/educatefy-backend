import type { Knex } from 'knex';

import { db } from '../db/index.js';
import logger from '../utils/logger.js';
import { Notification as NotificationRow } from '../types/db-generated-types.js';
import { buildNotificationLink, isEmailOnly } from './registry.js';
import { enqueueNotificationPush } from './pubsub.js';
import { NotificationData, NotificationType } from './types.js';

export type NotifyInput<T extends NotificationType> = {
  /** Recipient. */
  accountId: number;
  type: T;
  data: NotificationData<T>;
  /** Who caused the event. Used to suppress self-notifications. Defaults to none. */
  actorId?: number | null;
  /** Join the caller's transaction, so rows commit or roll back with the event. */
  trx?: Knex.Transaction;
};

export type NotifyManyInput<T extends NotificationType> = Omit<
  NotifyInput<T>,
  'accountId' | 'trx'
> & { trx?: Knex.Transaction };

/** Fan-out chunk size, so notifying every enrolled student stays bounded per query. */
const FAN_OUT_CHUNK_SIZE = 200;

type PreferenceRow = {
  account_id: number;
  email_enabled: boolean;
  in_app_enabled: boolean;
};

type ChunkContext<T extends NotificationType> = {
  conn: Knex | Knex.Transaction;
  type: T;
  typeId: number;
  emailOnly: boolean;
  data: NotificationData<T>;
  actorId: number | null;
  link: string | null;
};

type InAppContext<T extends NotificationType> = Pick<
  ChunkContext<T>,
  'conn' | 'typeId' | 'data' | 'actorId' | 'link'
>;

async function insertInAppNotifications<T extends NotificationType>(
  accountIds: number[],
  { conn, typeId, data, actorId, link }: InAppContext<T>,
): Promise<void> {
  const inserted = await conn<NotificationRow>('notification')
    .insert(
      accountIds.map((accountId) => ({
        account_id: accountId,
        type_id: typeId,
        actor_id: actorId,
        payload: data as Record<string, unknown>,
        link,
      })),
    )
    .returning('*');

  const rowByAccount = new Map(inserted.map((row) => [row.account_id, row]));

  const counts = await conn('notification')
    .whereIn('account_id', accountIds)
    .whereNull('read_at')
    .whereNull('deleted_at')
    .select('account_id')
    .count<Array<{ account_id: number; count: string }>>('* as count')
    .groupBy('account_id');

  const countByAccount = new Map(counts.map((row) => [row.account_id, Number(row.count)]));

  for (const accountId of accountIds) {
    const row = rowByAccount.get(accountId);

    if (row) {
      enqueueNotificationPush(accountId, {
        notification: row,
        unreadCount: countByAccount.get(accountId) ?? 1,
      });
    }
  }
}

async function notifyChunk<T extends NotificationType>(
  accountIds: number[],
  { conn, typeId, emailOnly, data, actorId, link }: ChunkContext<T>,
): Promise<void> {
  // A missing preference row means "both channels on", so existing accounts need no backfill.
  const preferences = await conn<PreferenceRow>('notification_preference')
    .where('type_id', typeId)
    .whereIn('account_id', accountIds)
    .select('account_id', 'email_enabled', 'in_app_enabled');

  const preferenceByAccount = new Map(preferences.map((row) => [row.account_id, row]));

  const wantsInApp: number[] = [];
  const wantsEmail: number[] = [];

  for (const accountId of accountIds) {
    const preference = preferenceByAccount.get(accountId);
    const inAppEnabled = preference ? preference.in_app_enabled : true;
    const emailEnabled = preference ? preference.email_enabled : true;

    if (inAppEnabled && !emailOnly) {
      wantsInApp.push(accountId);
    }

    if (emailEnabled) {
      wantsEmail.push(accountId);
    }
  }

  if (wantsInApp.length > 0) {
    await insertInAppNotifications(wantsInApp, {
      conn,
      typeId,
      data,
      actorId,
      link,
    });
  }

  if (wantsEmail.length > 0) {
    // The outbox carries its own copy of the payload: an email must still be
    // queued for someone who has in-app switched off.
    await conn('outbox').insert(
      wantsEmail.map((accountId) => ({
        account_id: accountId,
        type_id: typeId,
        payload: data as Record<string, unknown>,
      })),
    );
  }
}

async function getTypeRow(conn: Knex | Knex.Transaction, type: NotificationType) {
  const row = await conn('notification_type')
    .where('code', type)
    .first<{ id: number; is_active: boolean }>('id', 'is_active');

  return row ?? null;
}

export async function notifyMany<T extends NotificationType>(
  accountIds: ReadonlyArray<number>,
  input: NotifyManyInput<T>,
): Promise<void> {
  const { type, data, actorId = null, trx } = input;

  const recipients = [...new Set(accountIds.filter((id) => Number.isInteger(id) && id > 0))];

  // A teacher triggering an event aimed at themselves should not be notified about their own action.
  const targets = actorId ? recipients.filter((id) => id !== actorId) : recipients;

  if (targets.length === 0) {
    return;
  }

  const conn = trx ?? db;
  const typeRow = await getTypeRow(conn, type);

  if (typeRow === null) {
    logger.error({ type }, 'notification: type is missing from notification_type');
    return;
  }

  if (!typeRow.is_active) {
    logger.info({ type }, 'notification: type is inactive, skipping');
    return;
  }

  const context: ChunkContext<T> = {
    conn,
    type,
    typeId: typeRow.id,
    emailOnly: isEmailOnly(type),
    data,
    actorId,
    link: buildNotificationLink(type, data),
  };

  for (let offset = 0; offset < targets.length; offset += FAN_OUT_CHUNK_SIZE) {
    const chunk = targets.slice(offset, offset + FAN_OUT_CHUNK_SIZE);

    try {
      await notifyChunk(chunk, context);
    } catch (error) {
      logger.error(
        { err: error, type, chunkSize: chunk.length },
        'notification: failed to write notification rows',
      );
    }
  }
}

/** Notify one account. */
export async function notify<T extends NotificationType>(input: NotifyInput<T>): Promise<void> {
  await notifyMany([input.accountId], input);
}
