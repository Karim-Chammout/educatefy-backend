import config from '../../config.js';
import logger from '../../utils/logger.js';
import { MailTransport, MailTransportError, SendMailInput, SendMailResult } from './index.js';

const ENDPOINT = 'https://api.resend.com/emails';
const TIMEOUT_MS = 15_000;

/**
 * Resend over its HTTP API (no SDK, one `fetch`).
 * `Idempotency-Key` keeps a retry from becoming a second email.
 * 429/5xx are retryable, other 4xx are not.
 */
export class ResendTransport implements MailTransport {
  readonly key = 'resend';

  async send(input: SendMailInput): Promise<SendMailResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${config.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': input.idempotencyKey,
        },
        body: JSON.stringify({
          from: input.from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
          text: input.text,
          ...(input.tags ? { tags: input.tags } : {}),
        }),
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);

      throw new MailTransportError(`Resend request failed: ${reason}`, true);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      const retryable = response.status === 429 || response.status >= 500;

      logger.warn(
        { status: response.status, detail: detail.slice(0, 500) },
        'resend: request rejected',
      );

      throw new MailTransportError(
        `Resend responded ${response.status}: ${detail.slice(0, 300)}`,
        retryable,
      );
    }

    const body = (await response.json().catch(() => ({}))) as { id?: string };

    return { providerMessageId: body.id ?? null };
  }
}
