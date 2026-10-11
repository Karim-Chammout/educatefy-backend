import logger from '../utils/logger.js';
import { startMailWorker } from './worker.js';

export type NotificationServices = {
  stop: () => Promise<void>;
};

/**
 * Starts the background loop (outbox mail worker).
 * Called once from `src/index.ts`; timers are `unref()`d.
 */
export function startNotificationServices(): NotificationServices {
  const mail = startMailWorker();

  logger.info('notification: services started');

  return {
    stop: () => mail.stop(),
  };
}

export { notify, notifyMany } from './notify.js';
export type { NotifyInput, NotifyManyInput } from './notify.js';
export { NOTIFICATION_REGISTRY, buildNotificationLink } from './registry.js';
export { renderEmail } from './templates/render.js';
export { MailTransportError, getMailTransport } from './transport/index.js';
export type { MailTransport, SendMailInput, SendMailResult } from './transport/index.js';
export {
  NOTIFICATION_TOPIC,
  enqueueNotificationPush,
  flushNotificationPushes,
  pubSub,
  subscribeToNotificationActivity,
  withNotificationPushQueue,
} from './pubsub.js';
export type { NotificationActivity } from './pubsub.js';
export { NOTIFICATION_TYPES, isNotificationType } from './types.js';
export type { NotificationData, NotificationType } from './types.js';
