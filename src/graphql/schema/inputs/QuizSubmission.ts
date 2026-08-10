import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';

import QuizSubmissionAnswerInput from './QuizSubmissionAnswer.js';

const QuizSubmissionInput = new GraphQLInputObjectType({
  name: 'QuizSubmissionInput',
  description: 'Input for submitting a quiz attempt.',
  fields: {
    attemptId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID of the attempt being submitted.',
    },
    answers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(QuizSubmissionAnswerInput))),
      description: 'The answers selected for each question.',
    },
  },
});

export default QuizSubmissionInput;
