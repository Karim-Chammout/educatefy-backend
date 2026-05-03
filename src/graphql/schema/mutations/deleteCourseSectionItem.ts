import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import MutationResult from '../types/MutationResult.js';

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

      await db.transaction(async (transaction) => {
        const [deletedCourseSectionItems] = await transaction('course_section_item')
          .where('id', courseSectionItem.id)
          .update({
            deleted_at: db.fn.now(),
            updated_at: db.fn.now(),
          })
          .returning(['content_id', 'content_type']);

        // Delete the content attached to this 'deletedCourseSectionItem'
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
      console.log('Failed to delete course section: ', error);
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
      };
    }
  }),
};

export default deleteCourseSectionItem;
