import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';

import { QuizAttemptQuestion as QuizAttemptQuestionType } from '../../../types/db-generated-types.js';
import { QuizAttemptStatusEnumType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import QuizQuestionDifficulty from './enum/QuizQuestionDifficulty.js';
import QuizQuestionMediaType from './enum/QuizQuestionMediaType.js';
import QuizQuestionType from './enum/QuizQuestionType.js';
import { QuizAttemptAnswer } from './QuizAttemptAnswer.js';

type AnswerSnapshot = {
  id: number;
  denomination: string | null;
  image_url: string | null;
  is_correct: boolean;
};

export const QuizAttemptQuestion = new GraphQLObjectType<QuizAttemptQuestionType, ContextType>({
  name: 'QuizAttemptQuestion',
  description: 'A snapshot of a quiz question as the student saw it.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this attempt question snapshot.',
    },
    questionId: {
      type: GraphQLID,
      description: 'The ID of the original question, null if it was deleted since.',
      resolve: (parent) => parent.question_id,
    },
    prompt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text of the question as seen by the student.',
    },
    question_type: {
      type: new GraphQLNonNull(QuizQuestionType),
      description: 'The type of the question.',
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The order of this question within the attempt as displayed.',
    },
    points: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The points this question was worth.',
    },
    media_url: {
      type: GraphQLString,
      description: 'The URL of the media attached to this question.',
    },
    media_type: {
      type: QuizQuestionMediaType,
      description: 'The type of media attached to this question.',
    },
    hint: {
      type: GraphQLString,
      description: 'The hint of this question.',
    },
    difficulty: {
      type: QuizQuestionDifficulty,
      description: 'The difficulty of this question.',
    },
    learning_objective: {
      type: GraphQLString,
      description: 'The learning objective of this question.',
    },
    feedback_correct: {
      type: GraphQLString,
      description: 'The feedback shown when answered correctly.',
    },
    feedback_incorrect: {
      type: GraphQLString,
      description: 'The feedback shown when answered incorrectly.',
    },
    answers: {
      type: new GraphQLNonNull(GraphQLJSON),
      description:
        'The answer options as displayed. The correctness of each answer is only revealed once the attempt is completed.',
      resolve: async (parent, _, { loaders }) => {
        const attempt = await loaders.QuizAttempt.loadById(parent.attempt_id);
        const snapshot = parent.answers as AnswerSnapshot[];

        if (attempt?.status === QuizAttemptStatusEnumType.InProgress) {
          return snapshot.map(({ is_correct, ...answer }) => answer);
        }

        return snapshot;
      },
    },
    selectedAnswers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(QuizAttemptAnswer))),
      description: 'The answers selected by the student for this question.',
      resolve: async (parent, _, { loaders }) => {
        const answers = await loaders.QuizAttemptAnswer.loadByAttemptQuestionId(parent.id);

        return answers;
      },
    },
  },
});
