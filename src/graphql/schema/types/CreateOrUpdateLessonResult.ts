import { GraphQLObjectType } from 'graphql';

import { Lesson as LessonType } from '../../../types/db-generated-types';
import { authenticated } from '../../utils/auth';
import { Lesson } from './Lesson';
import { defaultMutationFields } from './MutationResult';

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
