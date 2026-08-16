import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';

const UpdateQuizQuestionRankInput = new GraphQLInputObjectType({
  name: 'UpdateQuizQuestionRankInput',
  description: 'Input for updating the rank of a quiz question.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the question.',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The new rank of the question.',
    },
  },
});

export default UpdateQuizQuestionRankInput;
