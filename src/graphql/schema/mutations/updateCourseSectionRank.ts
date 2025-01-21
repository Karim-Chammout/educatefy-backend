import { GraphQLFieldConfig, GraphQLList, GraphQLNonNull } from 'graphql';

import { UpdateCourseSectionRankInput as UpdateCourseSectionRankInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import UpdateCourseSectionRankInput from '../inputs/UpdateCourseSectionRank';
import MutationResult from '../types/MutationResult';

const updateCourseSectionRanks: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Updates the ranks of multiple course sections.',
  args: {
    sectionRanks: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UpdateCourseSectionRankInput))),
      description: 'The course sections and their new ranks',
    },
  },
  resolve: authenticated(
    async (
      _,
      { sectionRanks }: { sectionRanks: UpdateCourseSectionRankInputType[] },
      { db, loaders, user },
    ) => {
      if (!sectionRanks.length) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
        };
      }

      try {
        // Get the first section to verify course ownership
        const sectionId = parseInt(sectionRanks[0].id, 10);
        const courseSection = await loaders.CourseSection.loadById(sectionId);

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
          for (const section of sectionRanks) {
            await transaction('course_section').where('id', section.id).update({
              rank: section.rank,
              updated_at: db.fn.now(),
            });

            loaders.CourseSection.loaders.byIdLoader.clear(parseInt(section.id, 10));
          }
        });

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        console.log('Failed to update course section ranks: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateCourseSectionRanks;
