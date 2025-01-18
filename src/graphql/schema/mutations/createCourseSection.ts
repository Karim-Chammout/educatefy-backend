import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { CourseSectionInfoInput as CourseSectionInfoInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import CourseSectionInfoInput from '../inputs/CourseSectionInfo';
import { CreateOrUpdateCourseSectionResult } from '../types/CreateOrUpdateCourseSectionResult';
import { AccountRoleEnum } from '../types/enum/AccountRole';

const createCourseSection: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateCourseSectionResult,
  description: 'Creates a course section.',
  args: {
    courseSectionInfo: {
      type: new GraphQLNonNull(CourseSectionInfoInput),
      description: 'The course section information',
    },
  },
  resolve: authenticated(
    async (
      _,
      { courseSectionInfo }: { courseSectionInfo: CourseSectionInfoInputType },
      { db, loaders, user },
    ) => {
      const { courseId, denomination, is_published } = courseSectionInfo;

      if (!courseId || !denomination) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          courseSection: null,
        };
      }

      try {
        const accountRole = await loaders.AccountRole.loadById(user.roleId);

        if (accountRole.code !== AccountRoleEnum.Teacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
            courseSection: null,
          };
        }

        const parsedCourseId = parseInt(courseId, 10);
        const course = await loaders.Course.loadById(parsedCourseId);

        if (!course) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            courseSection: null,
          };
        }

        const [createdCourseSection] = await db('course_section')
          .insert({
            denomination: denomination.trim(),
            is_published,
            course_id: course.id,
          })
          .returning('id');

        return {
          success: true,
          errors: [],
          courseSection: createdCourseSection,
        };
      } catch (error) {
        console.log('Failed to create course section: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          courseSection: null,
        };
      }
    },
  ),
};

export default createCourseSection;
