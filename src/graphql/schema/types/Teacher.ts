import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

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
  }),
});
