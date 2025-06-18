import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { Account as AccountType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { getImageURL } from '../../../utils/getImageURL';

export const Teacher = new GraphQLObjectType<AccountType, ContextType>({
  name: 'Teacher',
  description: 'The properties of a teacher account',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this account',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the teacher',
    },
    nickname: {
      type: GraphQLString,
      description: 'The nickname of the teacher',
    },
    first_name: {
      type: GraphQLString,
      description: 'The first name of the teacher',
    },
    last_name: {
      type: GraphQLString,
      description: 'The last name of the teacher',
    },
    avatar_url: {
      type: GraphQLString,
      description: 'The avatar url of this teacher',
      resolve: async (parent) => (parent.avatar_url ? getImageURL(parent.avatar_url) : null),
    },
    bio: {
      type: GraphQLString,
      description: 'A short biography of the teacher',
    },
    description: {
      type: GraphQLString,
      description: 'A detailed description of the teacher',
    },
    isFollowed: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Indicates if the current user is following this teacher',
      resolve: async (parent, _, { loaders, user }) => {
        if (!user.authenticated) return false;

        const follow = await loaders.StudentTeacherFollow.loadByStudentIdAndTeacherId(
          user.id,
          parent.id,
        );

        if (!follow) return false;

        return follow.is_following;
      },
    },
    isAllowedToFollow: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Checks if the current user can follow this teacher (blocks self-follow).',
      resolve: async (parent, _, { user }) => {
        if (!user.authenticated) return false;

        // Prevent teachers from self-follow
        return user.id !== parent.id;
      },
    },
  }),
});
