import { GraphQLObjectType } from 'graphql';

import { Course as CourseType } from '../../../types/db-generated-types';
import { authenticated } from '../../utils/auth';
import { Course } from './Course';
import { defaultMutationFields } from './MutationResult';

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
