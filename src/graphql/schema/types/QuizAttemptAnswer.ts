import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { QuizAttemptAnswer as QuizAttemptAnswerType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';

export const QuizAttemptAnswer = new GraphQLObjectType<QuizAttemptAnswerType, ContextType>({
  name: 'QuizAttemptAnswer',
  description: 'An answer selected by the student in a quiz attempt.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this attempt answer.',
    },
    attemptQuestionId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the attempt question snapshot this answer belongs to.',
      resolve: (parent) => parent.attempt_question_id,
    },
    answerId: {
      type: GraphQLID,
      description: 'The ID of the original answer, null if it was deleted since.',
      resolve: (parent) => parent.answer_id,
    },
    denomination: {
      type: GraphQLString,
      description: 'The text of the answer as the student saw it.',
    },
    image_url: {
      type: GraphQLString,
      description: 'The image of the answer as the student saw it.',
    },
    is_correct: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the selected answer was correct at grading time.',
    },
  },
});
