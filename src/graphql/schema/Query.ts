import { GraphQLObjectType, GraphQLString } from 'graphql';

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    sayHello: {
      type: GraphQLString,
      description: 'Say Hello',
      resolve: () => 'Hello!',
    },
  },
});

export default Query;
