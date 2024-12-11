import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { ContextType } from '../../types/types';
import { authenticated } from '../utils/auth';
import { Account } from './types/Account';
import OpenidClient from './types/OpenidClient';

const Query = new GraphQLObjectType<any, ContextType>({
  name: 'Query',
  fields: {
    me: {
      type: new GraphQLNonNull(Account),
      description: 'The current user',
      resolve: authenticated((_, __, ctx) => {
        return ctx.loaders.Account.loadById(ctx.user.id);
      }),
    },
    openIdClients: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(OpenidClient))),
      description: 'List of OpenId clients',
      resolve: async (_, __, { loaders }) => {
        const oidc = await loaders.OpenidClient.loadAll();

        if (!oidc || oidc.length === 0) {
          return [];
        }

        return oidc;
      },
    },
  },
});

export default Query;
