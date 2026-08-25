import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import {
  validateSocialLinks,
  type SocialLinkPayload,
} from '../../../utils/socialLinkValidation.js';
import { authenticated } from '../../utils/auth.js';
import SocialLinkInfoInput from '../inputs/SocialLinkInfo.js';
import MutationResult from '../types/MutationResult.js';
import logger from '../../../utils/logger.js';

type SocialLinkGraphQLInput = {
  platform: string;
  userName?: string | null;
  url: string;
  displayName?: string | null;
  isPrimary?: boolean | null;
};

const updateAccountSocialLinks: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Replaces all social media links of the current account.',
  args: {
    links: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SocialLinkInfoInput))),
      description:
        'The full desired set of social links for this account. Empty array removes all links.',
    },
  },
  resolve: authenticated(
    async (_, { links }: { links: Array<SocialLinkGraphQLInput> }, { db, loaders, user }) => {
      const payloads: Array<SocialLinkPayload> = links.map((link) => ({
        platform: link.platform,
        user_name: link.userName ?? null,
        url: link.url,
        display_name: link.displayName ?? null,
        is_primary: link.isPrimary === true,
      }));

      const validation = validateSocialLinks(payloads);

      if (!validation.valid) {
        const errors = [new Error(validation.error)];
        if (validation.detail) {
          errors.push(new Error(validation.detail));
        }

        return {
          success: false,
          errors,
        };
      }

      try {
        await db.transaction(async (transaction) => {
          const existingRows = await transaction('account_social_links')
            .where('account_id', user.id)
            .select('platform', 'user_name', 'display_name', 'url', 'is_primary');

          const sameSet =
            existingRows.length === validation.links.length &&
            validation.links.every((link) =>
              existingRows.some(
                (row) =>
                  row.platform === link.platform &&
                  (row.user_name ?? null) === link.user_name &&
                  (row.display_name ?? null) === link.display_name &&
                  row.url === link.url &&
                  row.is_primary === link.is_primary,
              ),
            );

          if (sameSet) {
            return;
          }

          await transaction('account_social_links').where('account_id', user.id).del();

          if (validation.links.length > 0) {
            await transaction('account_social_links').insert(
              validation.links.map((link) => ({
                account_id: user.id,
                platform: link.platform,
                user_name: link.user_name,
                display_name: link.display_name,
                url: link.url,
                is_primary: link.is_primary,
              })),
            );
          }
        });

        loaders.AccountSocialLinks.loaders.byAccountIdLoader.clear(user.id);
        loaders.Account.loaders.byIdLoader.clear(user.id);

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to update account social links');

        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateAccountSocialLinks;
