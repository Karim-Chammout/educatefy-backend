import { GraphQLObjectType } from 'graphql';

import { Course as CourseType } from '../../../types/db-generated-types.js';
import { authenticated } from '../../utils/auth.js';
import { Course } from './Course.js';
import { defaultMutationFields } from './MutationResult.js';

type MutationResultType =
  | {
      success: true;
      errors: [];
      course: CourseType;
    }
  | {
      success: false;
      errors: Error[];
      course: null;
    };

export const UpdateCourseStatusResult = new GraphQLObjectType({
  name: 'UpdateCourseStatusResult',
  description: 'The result of the updateCourseStatus mutation.',
  fields: {
    ...defaultMutationFields,
    course: {
      type: Course,
      description: 'The updated course information.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders }) => {
        if (parent.success) {
          const course = await loaders.Course.loadById(parent.course.id);

          return course;
        }

        return null;
      }),
    },
  },
});
