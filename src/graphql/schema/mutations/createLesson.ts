import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { CourseSectionItemContentTypeEnumType } from '../../../types/db-generated-types.js';
import { LessonInfoInput as LessonInfoInputType } from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import LessonInfoInput from '../inputs/LessonInfo.js';
import { CreateOrUpdateLessonResult } from '../types/CreateOrUpdateLessonResult.js';
import logger from '../../../utils/logger.js';

const createLesson: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateLessonResult,
  description: 'Creates a lesson.',
  args: {
    lessonInfo: {
      type: new GraphQLNonNull(LessonInfoInput),
      description: 'The lesson information',
    },
  },
  resolve: authenticated(
    async (_, { lessonInfo }: { lessonInfo: LessonInfoInputType }, { db, loaders, user }) => {
      const { courseId, sectionId, denomination, duration, is_published } = lessonInfo;

      if (!courseId || !sectionId || !denomination || !duration) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          lesson: null,
        };
      }

      try {
        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
            lesson: null,
          };
        }

        const parsedCourseId = parseInt(courseId, 10);
        const course = await loaders.Course.loadById(parsedCourseId);

        if (!course) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            lesson: null,
          };
        }

        if (course.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
            lesson: null,
          };
        }

        const parsedSectionId = parseInt(sectionId, 10);
        const section = await loaders.CourseSection.loadById(parsedSectionId);

        if (!section || section.course_id !== course.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.INVALID_INPUT)],
            lesson: null,
          };
        }

        const createdLesson = await db.transaction(async (transaction) => {
          const [lesson] = await transaction('lesson')
            .insert({
              denomination: denomination.trim(),
              duration,
              is_published,
              course_id: course.id,
              teacher_id: user.id,
            })
            .returning('id');

          await transaction('course_section_item').insert({
            course_section_id: parsedSectionId,
            content_id: lesson.id,
            content_type: CourseSectionItemContentTypeEnumType.Lesson,
          });

          return lesson;
        });

        return {
          success: true,
          errors: [],
          lesson: createdLesson,
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to create lesson');
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          lesson: null,
        };
      }
    },
  ),
};

export default createLesson;
