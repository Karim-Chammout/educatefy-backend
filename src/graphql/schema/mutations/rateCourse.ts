import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { RateCourse as RateCourseType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { sanitizeText } from '../../../utils/sanitizeText';
import { authenticated } from '../../utils/auth';
import RateCourse from '../inputs/RateCourse';
import { RateCourseResult } from '../types/RateCourseResult';

const rateCourse: GraphQLFieldConfig<null, ContextType> = {
  type: RateCourseResult,
  description: 'Rate a course.',
  args: {
    ratingInfo: {
      type: new GraphQLNonNull(RateCourse),
      description: 'The course rating information.',
    },
  },
  resolve: authenticated(
    async (_, { ratingInfo }: { ratingInfo: RateCourseType }, { db, loaders, user }) => {
      const { courseId, rating, review } = ratingInfo;

      if (!courseId) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          course: null,
        };
      }

      if (rating && (rating < 1 || rating > 5)) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          course: null,
        };
      }

      try {
        const course = await loaders.Course.loadById(parseInt(courseId, 10));

        if (!course) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            course: null,
          };
        }

        const existingRating = await loaders.CourseRating.loadByAccountIdAndCourseId(
          user.id,
          course.id,
        );

        let courseReview = null;
        if (review) {
          courseReview = sanitizeText(review);
        }

        if (existingRating) {
          await db('course_rating')
            .where('id', existingRating.id)
            .update({
              rating: rating || null,
              review: courseReview,
              updated_at: db.fn.now(),
            });
        } else {
          await db('course_rating').insert({
            course_id: course.id,
            account_id: user.id,
            rating: rating || null,
            review: courseReview,
          });
        }

        loaders.CourseRating.loaders.byAccountIdAndCourseIdLoader.clear({
          accountId: user.id,
          courseId: course.id,
        });

        loaders.Course.loaders.byIdLoader.clear(course.id);

        return {
          success: true,
          errors: [],
          course,
        };
      } catch (error) {
        console.log('Failed to rate course: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          course: null,
        };
      }
    },
  ),
};

export default rateCourse;
