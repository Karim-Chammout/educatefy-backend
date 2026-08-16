import { GraphQLInt, GraphQLObjectType } from 'graphql';

import { QuizAttempt as QuizAttemptType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { QuizAttempt } from './QuizAttempt.js';
import { defaultMutationFields } from './MutationResult.js';

type MutationResultType =
  | {
      success: true;
      errors: [];
      quizAttempt: QuizAttemptType;
      timeLimitMinutes: number | null;
    }
  | {
      success: false;
      errors: Error[];
      quizAttempt: null;
      timeLimitMinutes: null;
    };

export const StartQuizResult = new GraphQLObjectType({
  name: 'StartQuizResult',
  description: 'The result of starting a quiz attempt.',
  fields: {
    ...defaultMutationFields,
    quizAttempt: {
      type: QuizAttempt,
      description: 'The created quiz attempt with its shuffled question snapshots.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders }) => {
        if (parent.success) {
          return loaders.QuizAttempt.loadById(parent.quizAttempt.id);
        }

        return null;
      }),
    },
    timeLimitMinutes: {
      type: GraphQLInt,
      description: 'The time limit of the quiz in minutes, null if there is no limit.',
      resolve: (parent: MutationResultType) => {
        return parent.success ? parent.timeLimitMinutes : null;
      },
    },
  },
});
