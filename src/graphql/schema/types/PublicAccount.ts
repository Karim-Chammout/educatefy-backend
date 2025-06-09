import { GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { Account as AccountType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { getImageURL } from '../../../utils/getImageURL';

export const PublicAccount = new GraphQLObjectType<AccountType, ContextType>({
  name: 'PublicAccount',
  description: 'The properties of a public account',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this account',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the account',
    },
    nickname: {
      type: GraphQLString,
      description: 'The nickname of the account',
    },
    first_name: {
      type: GraphQLString,
      description: 'The first name of the account',
    },
    last_name: {
      type: GraphQLString,
      description: 'The last name of the account',
    },
    avatar_url: {
      type: GraphQLString,
      description: 'The avatar url of this account',
      resolve: async (parent) => (parent.avatar_url ? getImageURL(parent.avatar_url) : null),
    },
  }),
});
