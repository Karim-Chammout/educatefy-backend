import { GraphQLObjectType } from 'graphql';

import { Lesson as LessonType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { Lesson } from './Lesson.js';
import { defaultMutationFields } from './MutationResult.js';

type MutationResultType =
  | {
      success: true;
      errors: [];
      lesson: LessonType;
    }
  | {
      success: false;
      errors: Error[];
      lesson: null;
    };

export const CreateOrUpdateLessonResult = new GraphQLObjectType({
  name: 'CreateOrUpdateLessonResult',
  description: 'The result of the creating or updating mutation.',
  fields: {
    ...defaultMutationFields,
    lesson: {
      type: Lesson,
      description: 'The created or updated lesson.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders }) => {
        if (parent.success) {
          const lesson = await loaders.Lesson.loadById(parent.lesson.id);

          return lesson;
        }

        return null;
      }),
    },
  },
});
