import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { NotificationType as NotificationTypeRow } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';

export const NotificationTypeInfo = new GraphQLObjectType<NotificationTypeRow, ContextType>({
  name: 'NotificationTypeInfo',
  description: 'A type the platform can notify about, as offered in the preferences UI.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this notification type.',
    },
    code: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The stable code stored on notifications and outbox rows.',
    },
  }),
});

export default NotificationTypeInfo;
