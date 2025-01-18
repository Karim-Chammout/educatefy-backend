import { GraphQLObjectType } from 'graphql';

import { CourseSection as CourseSectionType } from '../../../types/db-generated-types';
import { authenticated } from '../../utils/auth';
import { CourseSection } from './CourseSection';
import { defaultMutationFields } from './MutationResult';

type MutationResultType =
  | {
      success: true;
      errors: [];
      courseSection: CourseSectionType;
    }
  | {
      success: false;
      errors: Error[];
      courseSection: null;
    };

export const CreateOrUpdateCourseSectionResult = new GraphQLObjectType({
  name: 'CreateOrUpdateCourseSectionResult',
  description: 'The result of the creating or updating a course section.',
  fields: {
    ...defaultMutationFields,
    courseSection: {
      type: CourseSection,
      description: 'The created or updated course section.',
      resolve: authenticated(async (parent: MutationResultType, _, { loaders }) => {
        if (parent.success) {
          const courseSection = await loaders.CourseSection.loadById(parent.courseSection.id);

          return courseSection;
        }

        return null;
      }),
    },
  },
});
