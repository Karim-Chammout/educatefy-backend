import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';

const UpdateQuizAnswerRankInput = new GraphQLInputObjectType({
  name: 'UpdateQuizAnswerRankInput',
  description: 'Input for updating the rank of a quiz answer.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the answer.',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The new rank of the answer.',
    },
  },
});

export default UpdateQuizAnswerRankInput;
