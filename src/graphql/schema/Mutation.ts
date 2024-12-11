import { GraphQLBoolean, GraphQLObjectType } from 'graphql';

import updateAccountInfo from './mutations/updateAccountInfo';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    isTesting: {
      type: GraphQLBoolean,
      description: 'Mutation for testing',
      resolve: () => {
        return true;
      },
    },
    updateAccountInfo,
  },
});

export default Mutation;
