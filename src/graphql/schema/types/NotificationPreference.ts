import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

import { ContextType } from '../../../types/types.js';
import NotificationTypeEnum from './enum/NotificationType.js';

/**
 * One row of the preferences matrix: the two switches of a single type.
 * A missing row means both channels are on.
 */
const NotificationPreference = new GraphQLObjectType<{
  type: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}>({
  name: 'NotificationPreference',
  description: "A notification type's channel switches for the signed-in account.",
  fields: {
    type: {
      type: new GraphQLNonNull(NotificationTypeEnum),
      description: 'The notification type these switches apply to.',
    },
    emailEnabled: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether an email is sent for this type.',
    },
    inAppEnabled: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether an in-app row is created for this type.',
    },
  },
});

export type NotificationPreferenceItem = {
  type: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
};

export const notificationPreferenceFields: GraphQLFieldConfigMap<
  { items: NotificationPreferenceItem[] },
  ContextType
> = {
  items: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NotificationPreference))),
    description: 'Switches for every type this account may receive, in display order.',
  },
};

export const NotificationPreferences = new GraphQLObjectType<{
  items: NotificationPreferenceItem[];
}>({
  name: 'NotificationPreferences',
  description: "The signed-in account's notification preferences.",
  fields: { ...notificationPreferenceFields },
});
