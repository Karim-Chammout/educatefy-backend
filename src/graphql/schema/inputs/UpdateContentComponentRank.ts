import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';

const UpdateContentComponentRankInput = new GraphQLInputObjectType({
  name: 'UpdateContentComponentRankInput',
  description: 'Input for updating a content component rank',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the content component',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The new rank of the content component',
    },
  },
});

export default UpdateContentComponentRankInput;
