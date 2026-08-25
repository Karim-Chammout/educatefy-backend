import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { AccountSocialLinks as AccountSocialLinksType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import { SOCIAL_PLATFORMS, isSocialPlatform } from '../../../utils/socialLinkValidation.js';

export const SocialLink = new GraphQLObjectType<AccountSocialLinksType, ContextType>({
  name: 'SocialLink',
  description: 'A social media link attached to an account.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this social link.',
    },
    platform: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'The platform identifier (linkedin, x, youtube, github, instagram, facebook, tiktok, website).',
    },
    platformDisplayName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Human-readable platform name.',
      resolve: (parent) =>
        isSocialPlatform(parent.platform)
          ? SOCIAL_PLATFORMS[parent.platform].displayName
          : parent.platform,
    },
    userName: {
      type: GraphQLString,
      description: 'The username/handle on the platform (without leading @), if applicable.',
      resolve: (parent) => parent.user_name,
    },
    displayName: {
      type: GraphQLString,
      description:
        'Optional custom label chosen by the user. Falls back to the handle or platform name in UIs when absent.',
      resolve: (parent) => parent.display_name,
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The full https URL of the social profile.',
    },
    isPrimary: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether this is the highlighted main link of the account.',
      resolve: (parent) => parent.is_primary,
    },
  },
});

export default SocialLink;
