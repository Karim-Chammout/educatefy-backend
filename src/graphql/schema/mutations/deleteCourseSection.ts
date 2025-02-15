import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { hasTeacherRole } from '../../utils/hasTeacherRole';
import MutationResult from '../types/MutationResult';

const deleteCourseSection: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Deletes a course section.',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the course section to delete.',
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

      const courseSectionId = parseInt(id, 10);
      const courseSection = await loaders.CourseSection.loadById(courseSectionId);

      if (!courseSection) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
        };
      }

      await db.transaction(async (transaction) => {
        await transaction('course_section').where('id', courseSection.id).update({
          deleted_at: db.fn.now(),
          updated_at: db.fn.now(),
        });

        const deletedCourseSectionItems = await transaction('course_section_item')
          .where('course_section_id', courseSection.id)
          .update({
            deleted_at: db.fn.now(),
            updated_at: db.fn.now(),
          })
          .returning(['content_id', 'content_type']);

        // Delete the content attached to this 'deletedCourseSectionItems'
        for (const item of deletedCourseSectionItems) {
          await transaction(item.content_type).where('id', item.content_id).update({
            deleted_at: db.fn.now(),
            updated_at: db.fn.now(),
          });
        }
      });

      loaders.CourseSectionItem.loaders.byCourseSectionIdLoader.clear(courseSection.id);
      loaders.CourseSection.loaders.byIdLoader.clear(courseSection.id);

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

export default deleteCourseSection;
