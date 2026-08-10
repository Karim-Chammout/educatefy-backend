import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import MutationResult from '../types/MutationResult.js';
import logger from '../../../utils/logger.js';

const deleteCourseSectionItem: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Deletes a course section item.',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course section item to delete.',
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
      const isTeacher = await hasTeacherRole(loaders, user.roleId);

      if (!isTeacher) {
        return {
          success: false,
          errors: [new Error(ErrorType.FORBIDDEN)],
        };
      }

      const courseSectionItemId = parseInt(id, 10);
      const courseSectionItem = await loaders.CourseSectionItem.loadById(courseSectionItemId);

      if (!courseSectionItem) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
        };
      }

      const courseSection = await loaders.CourseSection.loadById(
        courseSectionItem.course_section_id,
      );
      const course = courseSection ? await loaders.Course.loadById(courseSection.course_id) : null;

      if (!course || course.teacher_id !== user.id) {
        return {
          success: false,
          errors: [new Error(ErrorType.FORBIDDEN)],
        };
      }

      await db.transaction(async (transaction) => {
        const [deletedCourseSectionItems] = await transaction('course_section_item')
          .where('id', courseSectionItem.id)
          .update({
            deleted_at: db.fn.now(),
            updated_at: db.fn.now(),
          })
          .returning(['content_id', 'content_type']);

        // Soft-delete the content attached to this item. Quizzes carry deleted_at
        // too, so their question/attempt rows are kept (immutable history) and the
        // generated Quiz loader filters them out of every read path.
        await transaction(deletedCourseSectionItems.content_type)
          .where('id', deletedCourseSectionItems.content_id)
          .update({
            deleted_at: db.fn.now(),
            updated_at: db.fn.now(),
          });
      });

      loaders.CourseSectionItem.loaders.byIdLoader.clear(courseSectionItem.id);

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      logger.error({ err: error, userId: user.id }, 'Failed to delete course section item');
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
      };
    }
  }),
};

export default deleteCourseSectionItem;
