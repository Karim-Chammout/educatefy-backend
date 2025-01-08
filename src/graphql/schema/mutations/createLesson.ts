import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { LessonInfoInput as LessonInfoInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import LessonInfoInput from '../inputs/LessonInfo';
import { CreateOrUpdateLessonResult } from '../types/CreateOrUpdateLessonResult';
import { AccountRoleEnum } from '../types/enum/AccountRole';

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
      const { courseId, denomination, duration, is_published } = lessonInfo;

      if (!courseId || !denomination || !duration) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          lesson: null,
        };
      }

      try {
        const accountRole = await loaders.AccountRole.loadById(user.roleId);

        if (accountRole.code !== AccountRoleEnum.Teacher) {
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

        const [createdLesson] = await db('lesson')
          .insert({
            denomination: denomination.trim(),
            duration,
            is_published,
            course_id: course.id,
            teacher_id: user.id,
          })
          .returning('id');

        return {
          success: true,
          errors: [],
          lesson: createdLesson,
        };
      } catch (error) {
        console.log('Failed to create lesson: ', error);
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
