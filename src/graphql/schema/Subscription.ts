import { GraphQLObjectType } from 'graphql';

import { subscribeToNotificationActivity } from '../../notification/pubsub.js';
import { AuthenticatedCtxType, ContextType } from '../../types/types.js';
import { authenticated } from '../utils/auth.js';
import { NotificationActivityType } from './types/NotificationActivity.js';

const Subscription = new GraphQLObjectType<unknown, ContextType>({
  name: 'Subscription',
  description: 'Live updates pushed to the authenticated account.',
  fields: {
    notificationActivity: {
      type: NotificationActivityType,
      description: 'Live notifications and unread totals for this account.',
      subscribe: authenticated(async function* (_, __, { user }: AuthenticatedCtxType) {
        for await (const activity of subscribeToNotificationActivity(user.id)) {
          yield { notificationActivity: activity };
        }
      }),
    },
  },
});

export default Subscription;
