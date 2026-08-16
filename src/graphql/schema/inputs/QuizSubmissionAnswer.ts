import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

const QuizSubmissionAnswerInput = new GraphQLInputObjectType({
  name: 'QuizSubmissionAnswerInput',
  description: 'The answers selected for a single question in a quiz submission.',
  fields: {
    questionId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the attempt question snapshot being answered.',
    },
    answerIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      description: 'The IDs of the selected answers.',
    },
  },
});

export default QuizSubmissionAnswerInput;
