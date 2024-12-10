import { GraphQLBoolean, GraphQLObjectType } from 'graphql';

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
  },
});

export default Mutation;
