import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import logger from '../../../utils/logger.js';
import { enqueueNotificationPush } from '../../../notification/pubsub.js';
import { authenticated } from '../../utils/auth.js';
import { countUnreadNotifications } from '../../utils/notificationPreferences.js';
import { ReadNotificationsResult } from '../types/NotificationMutationResults.js';

const readNotifications: GraphQLFieldConfig<null, ContextType> = {
  type: new GraphQLNonNull(ReadNotificationsResult),
  description: "Mark the authenticated account's notifications as read.",
  args: {
    ids: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description:
        'Only mark these ids as read. If omitted, mark all unread notifications as read.',
    },
  },
  resolve: authenticated(async (_, { ids }: { ids?: Array<string> | null }, { db, user }) => {
    const parsedIds = (ids ?? [])
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isInteger(id) && id > 0);

    try {
      const query = db('notification')
        .where('account_id', user.id)
        .whereNull('deleted_at')
        .whereNull('read_at');

      if (parsedIds.length > 0) {
        void query.whereIn('id', parsedIds);
      }

      const updated = await query.update({ read_at: db.fn.now() });

      const unreadCount = await countUnreadNotifications(db, user.id);

      if (updated > 0) {
        // Tell the account's other tabs so their badge drops without a refetch.
        enqueueNotificationPush(user.id, { notification: null, unreadCount });
      }

      return {
        success: true,
        errors: [],
        updatedCount: updated,
        unreadCount,
      };
    } catch (error) {
      logger.error({ err: error, userId: user.id }, 'Failed to mark notifications as read');

      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        updatedCount: 0,
        unreadCount: 0,
      };
    }
  }),
};

export default readNotifications;
