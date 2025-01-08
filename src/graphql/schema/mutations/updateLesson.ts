import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { UpdateLessonInfoInput as UpdateLessonInfoInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import UpdateLessonInfoInput from '../inputs/UpdateLessonInfo';
import { CreateOrUpdateLessonResult } from '../types/CreateOrUpdateLessonResult';

const updateLesson: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateLessonResult,
  description: 'Updates a lesson.',
  args: {
    lessonInfo: {
      type: new GraphQLNonNull(UpdateLessonInfoInput),
      description: 'The lesson information',
    },
  },
  resolve: authenticated(
    async (_, { lessonInfo }: { lessonInfo: UpdateLessonInfoInputType }, { db, loaders, user }) => {
      const { id, denomination, duration, is_published } = lessonInfo;

      if (!id) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          lesson: null,
        };
      }

      try {
        const lessonId = parseInt(id, 10);
        const lesson = await loaders.Lesson.loadById(lessonId);

        if (!lesson) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            lesson: null,
          };
        }

        if (lesson.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
            lesson: null,
          };
        }

        const dataToUpdate = {
          ...(denomination && { denomination: denomination.trim() }),
          ...(duration && { duration }),
          ...(is_published !== undefined && { is_published }),
        };

        const [updatedLesson] = await db('lesson')
          .where('id', lesson.id)
          .update({
            ...dataToUpdate,
            updated_at: db.fn.now(),
          })
          .returning('id');

        loaders.Lesson.loaders.byIdLoader.clear(updatedLesson.id);

        return {
          success: true,
          errors: [],
          lesson: updatedLesson,
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

export default updateLesson;
