import { createPubSub } from 'graphql-yoga';
import { AsyncLocalStorage } from 'node:async_hooks';

import { Notification as NotificationRow } from '../types/db-generated-types.js';

export type NotificationActivity = {
  notification: NotificationRow | null;
  unreadCount: number;
};

type PubSubEvents = {
  notification: [number, NotificationActivity];
};

export const NOTIFICATION_TOPIC = 'notification';

export const pubSub = createPubSub<PubSubEvents>();

type PendingPush = { accountId: number; activity: NotificationActivity };

/**
 * Pushes waiting for their transaction to commit. One queue per operation:
 * `pushScope` reaches it from deep resolvers, `queueByContext` from the plugin
 * after the response.
 */
const pushScope = new AsyncLocalStorage<PendingPush[]>();

const queueByContext = new WeakMap<object, PendingPush[]>();

/** Runs one GraphQL operation with its own push queue. */
export function withNotificationPushQueue<T>(context: object, run: () => T): T {
  const queue: PendingPush[] = [];

  queueByContext.set(context, queue);

  return pushScope.run(queue, run);
}

export function enqueueNotificationPush(accountId: number, activity: NotificationActivity): void {
  const queue = pushScope.getStore();

  if (!queue) {
    pubSub.publish(NOTIFICATION_TOPIC, accountId, activity);
    return;
  }

  queue.push({ accountId, activity });
}

export function flushNotificationPushes(context: object): void {
  const queue = queueByContext.get(context);

  if (!queue || queue.length === 0) {
    return;
  }

  queueByContext.delete(context);

  const batch = [...queue];
  queue.length = 0;

  for (const { accountId, activity } of batch) {
    pubSub.publish(NOTIFICATION_TOPIC, accountId, activity);
  }
}

/** One account's activity stream, for the `notificationActivity` subscription. */
export function subscribeToNotificationActivity(
  accountId: number,
): AsyncIterable<NotificationActivity> {
  return pubSub.subscribe(NOTIFICATION_TOPIC, accountId);
}
