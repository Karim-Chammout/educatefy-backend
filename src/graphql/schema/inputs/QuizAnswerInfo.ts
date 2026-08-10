import { GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLString } from 'graphql';

const QuizAnswerInfoInput = new GraphQLInputObjectType({
  name: 'QuizAnswerInfoInput',
  description: 'Input for creating a quiz answer option.',
  fields: {
    denomination: {
      type: GraphQLString,
      description: 'The text of this answer option.',
    },
    image_url: {
      type: GraphQLString,
      description: 'The URL of the image of this answer option.',
    },
    is_correct: {
      type: GraphQLBoolean,
      description: 'Whether this answer is correct.',
    },
    rank: {
      type: GraphQLInt,
      description: 'The rank of this answer within the question.',
    },
  },
});

export default QuizAnswerInfoInput;
