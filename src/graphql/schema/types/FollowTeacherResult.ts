import { GraphQLBoolean, GraphQLObjectType } from 'graphql';

import { defaultMutationFields } from './MutationResult';

export const FollowTeacherResult = new GraphQLObjectType({
  name: 'FollowTeacherResult',
  description: 'Result of following/unfollowing a teacher',
  fields: {
    ...defaultMutationFields,
    isFollowing: {
      type: GraphQLBoolean,
      description: 'Whether the student is now following the teacher',
    },
  },
});
