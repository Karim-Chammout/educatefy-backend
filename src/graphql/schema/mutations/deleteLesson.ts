import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import MutationResult from '../types/MutationResult';

const deleteLesson: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Deletes a lesson.',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the lesson to delete.',
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
      const lessonId = parseInt(id, 10);
      const lesson = await loaders.Lesson.loadById(lessonId);

      if (!lesson) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
        };
      }

      if (lesson.teacher_id !== user.id) {
        return {
          success: false,
          errors: [new Error(ErrorType.FORBIDDEN)],
        };
      }

      await db('lesson').where('id', lesson.id).update({
        deleted_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      loaders.Lesson.loaders.byIdLoader.clear(lesson.id);

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      console.log('Failed to delete lesson: ', error);
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
      };
    }
  }),
};

export default deleteLesson;
