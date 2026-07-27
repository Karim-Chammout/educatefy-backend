import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { CourseSectionInfoInput as CourseSectionInfoInputType } from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import logger from '../../../utils/logger.js';
import CourseSectionInfoInput from '../inputs/CourseSectionInfo.js';
import { CreateOrUpdateCourseSectionResult } from '../types/CreateOrUpdateCourseSectionResult.js';

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
        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
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
        logger.error({ err: error, userId: user.id }, 'Failed to create course section');
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
