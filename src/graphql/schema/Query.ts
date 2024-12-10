import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { ContextType } from '../../types/types';
import { OpenIdClient } from './types/openidClient';

const Query = new GraphQLObjectType<any, ContextType>({
  name: 'Query',
  fields: {
    openIdClients: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(OpenIdClient))),
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
