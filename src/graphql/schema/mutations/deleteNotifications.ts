import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import logger from '../../../utils/logger.js';
import { enqueueNotificationPush } from '../../../notification/pubsub.js';
import { authenticated } from '../../utils/auth.js';
import { countUnreadNotifications } from '../../utils/notificationPreferences.js';
import { DeleteNotificationsResult } from '../types/NotificationMutationResults.js';

const deleteNotifications: GraphQLFieldConfig<null, ContextType> = {
  type: new GraphQLNonNull(DeleteNotificationsResult),
  description: "Delete the authenticated account's notifications.",
  args: {
    ids: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      description: 'The IDs of the notifications to delete.',
    },
  },
  resolve: authenticated(async (_, { ids }: { ids: Array<string> }, { db, user }) => {
    const parsedIds = ids
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (parsedIds.length === 0) {
      return {
        success: false,
        errors: [new Error(ErrorType.INVALID_INPUT)],
        deletedCount: 0,
        unreadCount: 0,
      };
    }

    try {
      const deleted = await db('notification')
        .where('account_id', user.id)
        .whereNull('deleted_at')
        .whereIn('id', parsedIds)
        .update({ deleted_at: db.fn.now() });

      const unreadCount = await countUnreadNotifications(db, user.id);

      if (deleted > 0) {
        enqueueNotificationPush(user.id, { notification: null, unreadCount });
      }

      return { success: true, errors: [], deletedCount: deleted, unreadCount };
    } catch (error) {
      logger.error({ err: error, userId: user.id }, 'Failed to delete notifications');

      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        deletedCount: 0,
        unreadCount: 0,
      };
    }
  }),
};

export default deleteNotifications;
