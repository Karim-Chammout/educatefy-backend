import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { DeleteCourseRatingInput as DeleteCourseRatingType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import DeleteCourseRatingInput from '../inputs/DeleteCourseRating';
import MutationResult from '../types/MutationResult';

const deleteCourseRating: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Delete a course rating.',
  args: {
    ratingInfo: {
      type: new GraphQLNonNull(DeleteCourseRatingInput),
      description: 'The course rating to be deleted.',
    },
  },
  resolve: authenticated(
    async (_, { ratingInfo }: { ratingInfo: DeleteCourseRatingType }, { db, loaders, user }) => {
      const { courseId, courseRateId } = ratingInfo;
      const parsedCourseId = parseInt(courseId, 10);
      const parsedCourseRateId = parseInt(courseRateId, 10);

      if (!courseId || !courseRateId) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
        };
      }

      try {
        const course = await loaders.Course.loadById(parseInt(courseId, 10));

        if (!course) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
          };
        }

        const existingRating = await loaders.CourseRating.loadByAccountIdAndCourseId(
          user.id,
          course.id,
        );

        if (
          !existingRating ||
          existingRating.account_id !== user.id ||
          existingRating.course_id !== parsedCourseId ||
          existingRating.id !== parsedCourseRateId
        ) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
          };
        }

        await db('course_rating').where({ id: existingRating.id }).del();

        loaders.CourseRating.loaders.byIdLoader.clear(existingRating.id);

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        console.log('Failed to delete course rating: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default deleteCourseRating;
