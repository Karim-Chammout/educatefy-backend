import { ResendTransport } from './resendTransport.js';

export type SendMailInput = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  /** Key derived from the outbox row id; providers use it to dedupe retries. */
  idempotencyKey: string;
  tags?: Record<string, string>;
};

export type SendMailResult = {
  providerMessageId: string | null;
};

/** `retryable: false` means the row should fail immediately, not be retried. */
export class MailTransportError extends Error {
  retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = 'MailTransportError';
    this.retryable = retryable;
  }
}

export interface MailTransport {
  readonly key: string;
  send(input: SendMailInput): Promise<SendMailResult>;
}

const provider: MailTransport = new ResendTransport();

export function getMailTransport(): MailTransport {
  return provider;
}
