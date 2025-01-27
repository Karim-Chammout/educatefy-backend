import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull } from 'graphql';

import { UpdateCourseSectionItemRankInput as UpdateCourseSectionItemRankInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import UpdateCourseSectionItemRankInput from '../inputs/UpdateCourseSectionItemRank';
import MutationResult from '../types/MutationResult';

const updateCourseSectionItemRanks: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Updates the ranks of multiple course section items.',
  args: {
    sectionItemRanks: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(UpdateCourseSectionItemRankInput)),
      ),
      description: 'The course section items and their new ranks',
    },
  },
  resolve: authenticated(
    async (
      _,
      { sectionItemRanks }: { sectionItemRanks: UpdateCourseSectionItemRankInputType[] },
      { db, loaders, user },
    ) => {
      if (!sectionItemRanks.length) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
        };
      }

      try {
        // Get the first section to verify course ownership
        const itemId = parseInt(sectionItemRanks[0].id, 10);
        const courseSectionItem = await loaders.CourseSectionItem.loadById(itemId);
        const courseSection = await loaders.CourseSection.loadById(
          courseSectionItem.course_section_id,
        );

        if (!courseSection) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
          };
        }

        const course = await loaders.Course.loadById(courseSection.course_id);

        if (!course || course.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
          };
        }

        await db.transaction(async (transaction) => {
          for (const item of sectionItemRanks) {
            await transaction('course_section_item').where('id', item.id).update({
              rank: item.rank,
              updated_at: db.fn.now(),
            });

            loaders.CourseSectionItem.loaders.byIdLoader.clear(parseInt(item.id, 10));
          }
        });

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        console.log('Failed to update course section item ranks: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateCourseSectionItemRanks;
