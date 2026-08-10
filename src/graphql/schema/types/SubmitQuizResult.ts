import { GraphQLObjectType } from 'graphql';

import { QuizAttempt as QuizAttemptType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { QuizAttempt } from './QuizAttempt.js';
import { defaultMutationFields } from './MutationResult.js';

type MutationResultType =
  | {
      success: true;
      errors: [];
      quizAttempt: QuizAttemptType;
    }
  | {
      success: false;
      errors: Error[];
      quizAttempt: null;
    };

export const SubmitQuizResult = new GraphQLObjectType({
  name: 'SubmitQuizResult',
  description: 'The result of submitting a quiz attempt.',
  fields: {
    ...defaultMutationFields,
    quizAttempt: {
      type: QuizAttempt,
      description: 'The completed quiz attempt with grading and review data.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders }) => {
        if (parent.success) {
          return loaders.QuizAttempt.loadById(parent.quizAttempt.id);
        }

        return null;
      }),
    },
  },
});
