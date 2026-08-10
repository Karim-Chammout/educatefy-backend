import { GraphQLObjectType } from 'graphql';

import { Quiz as QuizType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { Quiz } from './Quiz.js';
import { defaultMutationFields } from './MutationResult.js';

type MutationResultType =
  | {
      success: true;
      errors: [];
      quiz: QuizType;
    }
  | {
      success: false;
      errors: Error[];
      quiz: null;
    };

export const CreateOrUpdateQuizResult = new GraphQLObjectType({
  name: 'CreateOrUpdateQuizResult',
  description: 'The result of the creating or updating mutation.',
  fields: {
    ...defaultMutationFields,
    quiz: {
      type: Quiz,
      description: 'The created or updated quiz.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders }) => {
        if (parent.success) {
          const quiz = await loaders.Quiz.loadById(parent.quiz.id);

          return quiz;
        }

        return null;
      }),
    },
  },
});
