import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { defaultMutationFields } from './MutationResult.js';
import {
  NotificationPreferenceItem,
  notificationPreferenceFields,
} from './NotificationPreference.js';

type ResultBase = {
  success: boolean;
  errors: Error[];
};

type CountedResult = ResultBase & {
  unreadCount: number;
};

type ReadNotificationsResultType = CountedResult & { updatedCount: number };

export const ReadNotificationsResult = new GraphQLObjectType<
  ReadNotificationsResultType,
  ContextType
>({
  name: 'ReadNotificationsResult',
  description: 'The result of marking notifications as read, with the updated unread total.',
  fields: {
    ...defaultMutationFields,
    updatedCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'How many notifications this call marked as read.',
    },
    unreadCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The recipient's unread total after the change.",
    },
  },
});

type DeleteNotificationsResultType = CountedResult & { deletedCount: number };

export const DeleteNotificationsResult = new GraphQLObjectType<
  DeleteNotificationsResultType,
  ContextType
>({
  name: 'DeleteNotificationsResult',
  description: 'The result of deleting notifications, with the updated unread total.',
  fields: {
    ...defaultMutationFields,
    deletedCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'How many notifications this call deleted.',
    },
    unreadCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The recipient's unread total after the change.",
    },
  },
});

type NotificationPreferenceResultType = ResultBase & {
  items: NotificationPreferenceItem[];
};

export const UpdateNotificationPreferenceResult = new GraphQLObjectType<
  NotificationPreferenceResultType,
  ContextType
>({
  name: 'UpdateNotificationPreferenceResult',
  description: "The recipient's notification preferences after the change.",
  fields: { ...defaultMutationFields, ...notificationPreferenceFields },
});
