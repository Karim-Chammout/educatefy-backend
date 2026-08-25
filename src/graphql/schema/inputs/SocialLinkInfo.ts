import { GraphQLBoolean, GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';

const SocialLinkInfo = new GraphQLInputObjectType({
  name: 'SocialLinkInfo',
  description: 'Input for a single social media link of an account.',
  fields: {
    platform: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'One of the supported platforms (linkedin, x, youtube, github, instagram, facebook, tiktok, website).',
    },
    userName: {
      type: GraphQLString,
      description:
        'The username/handle on the platform, without the leading @. Optional for websites.',
    },
    displayName: {
      type: GraphQLString,
      description:
        'Optional custom label chosen by the user (e.g. "My portfolio"). Falls back to the handle or platform name when absent.',
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The full https URL of the social profile.',
    },
    isPrimary: {
      type: GraphQLBoolean,
      description:
        'Flags the main link to be highlighted on the profile. At most one link per account keeps this flag (last one wins).',
    },
  },
});

export default SocialLinkInfo;
