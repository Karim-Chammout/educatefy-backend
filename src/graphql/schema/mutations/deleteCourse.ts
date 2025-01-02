import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import MutationResult from '../types/MutationResult';

const deleteCourse: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Deletes a course.',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course to delete.',
    },
  },
  resolve: authenticated(async (_, { id }: { id: string }, { db, loaders, user }) => {
    if (!id) {
      return {
        success: false,
        errors: [new Error(ErrorType.INVALID_INPUT)],
      };
    }

    try {
      const courseId = parseInt(id, 10);
      const course = await loaders.Course.loadById(courseId);

      if (!course) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
        };
      }

      if (course.teacher_id !== user.id) {
        return {
          success: false,
          errors: [new Error(ErrorType.FORBIDDEN)],
        };
      }

      await db('course').where('id', course.id).update({
        deleted_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      // Clear the loader cache for this course
      loaders.Course.loaders.byIdLoader.clear(course.id);

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      console.log('Failed to delete course: ', error);
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
      };
    }
  }),
};

export default deleteCourse;
