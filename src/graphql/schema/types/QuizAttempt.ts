import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

import { QuizAttempt as QuizAttemptType } from '../../../types/db-generated-types.js';
import { ContextType } from '../../../types/types.js';
import GraphQLDate from '../Scalars/Date.js';
import QuizAttemptStatus from './enum/QuizAttemptStatus.js';
import { QuizAttemptQuestion } from './QuizAttemptQuestion.js';

export const QuizAttempt = new GraphQLObjectType<QuizAttemptType, ContextType>({
  name: 'QuizAttempt',
  description: 'An attempt of a quiz taken by a student.',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique id of this attempt.',
    },
    quizId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the quiz this attempt belongs to.',
      resolve: (parent) => parent.quiz_id,
    },
    accountId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the account that took the attempt.',
      resolve: (parent) => parent.account_id,
    },
    enrollmentId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the enrollment this attempt belongs to.',
      resolve: (parent) => parent.enrollment_id,
    },
    attempt_number: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The 1-based number of this attempt for the account.',
    },
    status: {
      type: new GraphQLNonNull(QuizAttemptStatus),
      description: 'The status of this attempt.',
    },
    score: {
      type: GraphQLInt,
      description: 'The score in percentage, null while the attempt is in progress.',
    },
    earned_points: {
      type: GraphQLInt,
      description: 'The points earned, null while the attempt is in progress.',
    },
    total_points: {
      type: GraphQLInt,
      description: 'The total points available, null while the attempt is in progress.',
    },
    passed: {
      type: GraphQLBoolean,
      description: 'Whether the attempt passed the quiz, null while in progress.',
    },
    timed_out: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the attempt was submitted after the time limit.',
    },
    started_at: {
      type: new GraphQLNonNull(GraphQLDate),
      description: 'When the attempt was started (server time).',
    },
    submitted_at: {
      type: GraphQLDate,
      description: 'When the attempt was submitted.',
    },
    questions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(QuizAttemptQuestion))),
      description: 'The snapshot of the questions as seen by the student.',
      resolve: async (parent, _, { loaders }) => {
        const questions = await loaders.QuizAttemptQuestion.loadByAttemptId(parent.id);

        return [...questions].sort((a, b) => a.rank - b.rank);
      },
    },
    questionCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The number of questions in this attempt. Useful for sequential navigation without revealing the questions themselves.',
      resolve: async (parent, _, { db }) => {
        const rows = await db('quiz_attempt_question')
          .where('attempt_id', parent.id)
          .count('id as count')
          .first();

        return parseInt(String(rows?.count ?? 0), 10);
      },
    },
  },
});
