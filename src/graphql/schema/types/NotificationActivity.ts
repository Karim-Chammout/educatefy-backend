import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { NotificationActivity } from '../../../notification/pubsub.js';
import Notification from './Notification.js';

export const NotificationActivityType = new GraphQLObjectType<NotificationActivity, ContextType>({
  name: 'NotificationActivity',
  description: 'A live in-app notification and the unread total for the authenticated account.',
  fields: () => ({
    notification: {
      type: Notification,
      description: 'The new notification, or null when only the unread total changed.',
    },
    unreadCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The recipient's unread total after this change.",
    },
  }),
});

export default NotificationActivityType;
