import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import {
  CourseInfoInput as CourseInfoInputType,
  CourseLevel,
} from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { getSelectedLanguageId } from '../../utils/getSelectedLanguageId.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import { isValidSlug } from '../../utils/isValidSlug.js';
import logger from '../../../utils/logger.js';
import CourseInfoInput from '../inputs/CourseInfo.js';
import { CreateOrUpdateCourseResult } from '../types/CreateOrUpdateCourseResult.js';

const createCourse: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateCourseResult,
  description: 'Creates a course.',
  args: {
    courseInfo: {
      type: new GraphQLNonNull(CourseInfoInput),
      description: 'The course information',
    },
  },
  resolve: authenticated(
    async (_, { courseInfo }: { courseInfo: CourseInfoInputType }, { db, loaders, user }) => {
      const {
        denomination,
        description,
        slug,
        level,
        is_published,
        subtitle,
        end_date,
        image,
        language,
        external_resource_link,
        start_date,
        subjectIds,
        objectives,
        requirements,
      } = courseInfo;

      if (
        !denomination ||
        !slug ||
        !description ||
        !subtitle ||
        !Object.values(CourseLevel).includes(level)
      ) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          course: null,
        };
      }

      const languageId = await getSelectedLanguageId(loaders, language, true);

      if (!languageId) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_SUPPORTED_LANGUAGE)],
          course: null,
        };
      }

      const lowercaseSlug = slug.toLowerCase();

      if (!isValidSlug(lowercaseSlug)) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_SLUG)],
          course: null,
        };
      }

      const existingCourseBySlug = await loaders.Course.loadBySlug(lowercaseSlug);

      if (existingCourseBySlug) {
        return {
          success: false,
          errors: [new Error(ErrorType.SLUG_ALREADY_TAKEN)],
          course: null,
        };
      }

      try {
        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
            course: null,
          };
        }

        const filteredCourseInfo = {
          denomination,
          slug: lowercaseSlug,
          description,
          level,
          is_published,
          subtitle,
          language_id: languageId,
          ...(image && { image }),
          ...(external_resource_link && { external_resource_link }),
          ...(end_date && { end_date }),
          ...(start_date && { start_date }),
          teacher_id: user.id,
        };

        const createdCourse = await db.transaction(async (transaction) => {
          const [course] = await transaction('course').insert(filteredCourseInfo).returning('id');

          if (subjectIds && subjectIds.length > 0) {
            // Verify that all subject IDs exist
            const subjects = await transaction('subject').whereIn('id', subjectIds);
            if (subjects.length !== subjectIds.length) {
              return {
                success: false,
                errors: [new Error(ErrorType.INVALID_SUBJECTS)],
                course: null,
              };
            }

            for (const subjectId of subjectIds) {
              await transaction('course__subject').insert({
                course_id: course.id,
                subject_id: subjectId,
              });
            }
          }

          if (objectives && objectives.length > 0) {
            for (const objective of objectives) {
              await transaction('course_objective').insert({
                course_id: course.id,
                objective: objective,
              });
            }
          }

          if (requirements && requirements.length > 0) {
            for (const requirement of requirements) {
              await transaction('course_requirement').insert({
                course_id: course.id,
                requirement: requirement,
              });
            }
          }

          return course;
        });

        return {
          success: true,
          errors: [],
          course: createdCourse,
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to create course');
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          course: null,
        };
      }
    },
  ),
};

export default createCourse;
