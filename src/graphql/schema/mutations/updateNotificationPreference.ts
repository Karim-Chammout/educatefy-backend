import { GraphQLBoolean, GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import logger from '../../../utils/logger.js';
import { authenticated } from '../../utils/auth.js';
import { audienceFor, readNotificationPreference } from '../../utils/notificationPreferences.js';
import { UpdateNotificationPreferenceResult } from '../types/NotificationMutationResults.js';
import NotificationTypeEnum from '../types/enum/NotificationType.js';

const updateNotificationPreference: GraphQLFieldConfig<null, ContextType> = {
  type: new GraphQLNonNull(UpdateNotificationPreferenceResult),
  description: "Set one notification type's channel switches for this account.",
  args: {
    type: {
      type: new GraphQLNonNull(NotificationTypeEnum),
      description: 'The notification type these switches apply to.',
    },
    emailEnabled: {
      type: GraphQLBoolean,
      description: 'Turn the email channel on or off.',
    },
    inAppEnabled: {
      type: GraphQLBoolean,
      description: 'Turn the in-app channel on or off.',
    },
  },
  resolve: authenticated(
    async (
      _,
      {
        type,
        emailEnabled,
        inAppEnabled,
      }: {
        type: string;
        emailEnabled?: boolean | null;
        inAppEnabled?: boolean | null;
      },
      { db, user, loaders },
    ) => {
      if (emailEnabled == null && inAppEnabled == null) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          items: [],
        };
      }

      try {
        const typeRow = await db('notification_type')
          .where('code', type)
          .first<{ id: number; is_active: boolean; is_configurable: boolean }>();

        if (!typeRow || !typeRow.is_active || !typeRow.is_configurable) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_INPUT)],
            items: [],
          };
        }

        const patch: { email_enabled?: boolean; in_app_enabled?: boolean } = {};

        if (emailEnabled != null) {
          patch.email_enabled = emailEnabled;
        }

        if (inAppEnabled != null) {
          patch.in_app_enabled = inAppEnabled;
        }

        await db('notification_preference')
          .insert({
            account_id: user.id,
            type_id: typeRow.id,
            ...patch,
          })
          .onConflict(['account_id', 'type_id'])
          .merge({
            ...patch,
            updated_at: db.fn.now(),
          });

        const audience = await audienceFor(loaders, user.roleId);
        const items = await readNotificationPreference(db, user.id, audience);

        return {
          success: true,
          errors: [],
          items,
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to update notification preference');

        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          items: [],
        };
      }
    },
  ),
};

export default updateNotificationPreference;
