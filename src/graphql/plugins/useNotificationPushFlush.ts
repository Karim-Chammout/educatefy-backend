import { handleStreamOrSingleExecutionResult } from '@envelop/core';
import type { Plugin } from '@envelop/types';

import { flushNotificationPushes, withNotificationPushQueue } from '../../notification/pubsub.js';
import logger from '../../utils/logger.js';

/**
 * Flushes queued notification pushes into WebSocket messages, after the
 * transaction that created them has committed. Gives each operation its own
 * queue, then drains it once the response exists. Wraps `executeFn` so Yoga's
 * other execute plugins stay chained.
 */
export const useNotificationPushFlush: Plugin = {
  onExecute({ args, executeFn, setExecuteFn }) {
    const context = args.contextValue as object;

    setExecuteFn((executeArgs) => withNotificationPushQueue(context, () => executeFn(executeArgs)));

    return {
      onExecuteDone: (payload) => {
        handleStreamOrSingleExecutionResult(payload, () => {
          try {
            flushNotificationPushes(context);
          } catch (error) {
            logger.error({ err: error }, 'notifications: failed to flush live pushes');
          }
        });
      },
    };
  },
};
