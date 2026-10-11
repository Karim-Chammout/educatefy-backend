import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import Notification from './Notification.js';
import NotificationCategory from './enum/NotificationCategory.js';

export const NotificationsPaginatedResult = new GraphQLObjectType({
  name: 'NotificationsPaginatedResult',
  description:
    "A page of the recipient's notifications together with the unread totals for the bell badge.",
  fields: {
    items: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Notification))),
      description: 'The notifications for the requested page, newest first.',
    },
    totalCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of notifications across all pages, ignoring the type filter.',
    },
    unreadCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The recipient's current unread total, across every type.",
    },
    availableCategories: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NotificationCategory))),
      description:
        "The categories the recipient actually has notifications for, ordered for display. Drives the filter chips — an empty list means no filter besides 'all'.",
    },
  },
});
