import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';

import { Notification as NotificationType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { Account } from './Account.js';
import GraphQLDate from '../Scalars/Date.js';
import NotificationCategory from './enum/NotificationCategory.js';
import NotificationTypeEnum from './enum/NotificationType.js';

const Notification = new GraphQLObjectType<NotificationType, ContextType>({
  name: 'Notification',
  description: 'An in-app notification.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this notification.',
    },
    type: {
      type: new GraphQLNonNull(NotificationTypeEnum),
      description: 'The kind of event this notification was generated from.',
      resolve: async (parent, _, { loaders }) => {
        const type = await loaders.NotificationType.loadById(parent.type_id);

        return type.code;
      },
    },
    category: {
      type: new GraphQLNonNull(NotificationCategory),
      description: 'The bucket this notification belongs to, used for grouping and filtering.',
      resolve: async (parent, _, { loaders }) => {
        const type = await loaders.NotificationType.loadById(parent.type_id);

        return type.category;
      },
    },
    payload: {
      type: new GraphQLNonNull(GraphQLJSON),
      description: 'Raw event data for this notification. Localize it on the client.',
    },
    link: {
      type: GraphQLString,
      description: 'Relative in-app route this notification points at, or null if informational.',
    },
    is_read: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the recipient has read this notification.',
      resolve: (parent) => parent.read_at !== null,
    },
    read_at: {
      type: GraphQLDate,
      description: 'When the notification was read, or null if it is unread.',
    },
    created_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'When the notification was generated.',
    },
    actor: {
      type: Account,
      description: 'The account that triggered the event, if any.',
      resolve: async (parent, _, { loaders }) => {
        if (!parent.actor_id) {
          return null;
        }

        return loaders.Account.loadById(parent.actor_id);
      },
    },
  }),
});

export default Notification;
