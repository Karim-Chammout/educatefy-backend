import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import {
  CourseStatus,
  CourseStatusInput as CourseStatusInputType,
} from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import CourseStatusInput from '../inputs/CourseStatus';
import { UpdateCourseStatusResult } from '../types/UpdateCourseStatusResult';

const updateCourseStatus: GraphQLFieldConfig<null, ContextType> = {
  type: UpdateCourseStatusResult,
  description: 'Updates the status of a course.',
  args: {
    courseStatusInput: {
      type: new GraphQLNonNull(CourseStatusInput),
      description: 'The course status to update',
    },
  },
  resolve: authenticated(
    async (
      _,
      { courseStatusInput }: { courseStatusInput: CourseStatusInputType },
      { db, loaders, user },
    ) => {
      const { id, status } = courseStatusInput;

      if (!id || !status || !Object.values(CourseStatus).includes(status)) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          course: null,
        };
      }

      const courseId = parseInt(id, 10);
      const course = await loaders.Course.loadById(courseId);

      if (!course) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
          course: null,
        };
      }

      try {
        const result = await db.transaction(async (transaction) => {
          // Check if enrollment exists
          const existingEnrollment = await loaders.Enrollment.loadByAccountIdAndCourseId(
            user.id,
            course.id,
          );

          if (!existingEnrollment) {
            const [enrollment] = await transaction('enrollment')
              .insert({
                course_id: course.id,
                account_id: user.id,
                status,
              })
              .returning('id');

            // Create initial enrollment_history record
            await transaction('enrollment_history').insert({
              enrollment_id: enrollment.id,
              old_status: CourseStatus.Available, // Initial status
              new_status: status,
            });

            return {
              success: true,
              errors: [],
              course: course,
            };
          }

          if ((existingEnrollment.status as string) === status) {
            return {
              success: false,
              errors: [new Error(ErrorType.INVALID_INPUT)],
              course: null,
            };
          }

          // Update enrollment status
          await transaction('enrollment')
            .where({
              id: existingEnrollment.id,
            })
            .update({
              status,
              updated_at: db.fn.now(),
            });

          // Create enrollment_history record
          await transaction('enrollment_history').insert({
            enrollment_id: existingEnrollment.id,
            old_status: existingEnrollment.status,
            new_status: status,
          });

          return {
            success: true,
            errors: [],
            course: course,
          };
        });

        loaders.Enrollment.loaders.byAccountIdAndCourseIdLoader.clear({
          accountId: user.id,
          courseId: course.id,
        });

        return result;
      } catch (error) {
        console.log('Failed to update course status: ', error);

        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          course: null,
        };
      }
    },
  ),
};

export default updateCourseStatus;
