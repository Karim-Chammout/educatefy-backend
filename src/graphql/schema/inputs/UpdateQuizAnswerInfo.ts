import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLString,
} from 'graphql';

const UpdateQuizAnswerInfoInput = new GraphQLInputObjectType({
  name: 'UpdateQuizAnswerInfoInput',
  description: 'Input for updating a quiz answer option. A null id means the answer is new.',
  fields: {
    id: {
      type: GraphQLID,
      description: 'The ID of the answer to update, null for a new answer.',
    },
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

export default UpdateQuizAnswerInfoInput;
