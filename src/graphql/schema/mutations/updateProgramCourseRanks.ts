import { GraphQLFieldConfig, GraphQLID, GraphQLList, GraphQLNonNull } from 'graphql';

import { UpdateCourseSectionItemRankInput as UpdateCourseSectionItemRankInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import UpdateProgramCourseRankInput from '../inputs/UpdateProgramCourseRank';
import MutationResult from '../types/MutationResult';

const updateProgramCourseRanks: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Updates the ranks of multiple courses within a program.',
  args: {
    programId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program to update course ranks for.',
    },
    courseRanks: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UpdateProgramCourseRankInput))),
      description: 'The courses and their new ranks within the program',
    },
  },
  resolve: authenticated(
    async (
      _,
      {
        programId,
        courseRanks,
      }: { programId: string; courseRanks: UpdateCourseSectionItemRankInputType[] },
      { db, loaders, user },
    ) => {
      if (!programId || !courseRanks.length) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
        };
      }

      const parsedProgramId = parseInt(programId, 10);

      try {
        // Verify program ownership
        const program = await loaders.Program.loadById(parsedProgramId);

        if (!program) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
          };
        }

        if (program.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
          };
        }

        await db.transaction(async (transaction) => {
          for (const course of courseRanks) {
            await transaction('course__program')
              .where({
                program_id: programId,
                course_id: course.id,
              })
              .update({
                rank: course.rank,
                updated_at: db.fn.now(),
              });

            loaders.CourseProgram.loaders.byProgramIdLoader.clear(parsedProgramId);
          }
        });

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        console.log('Failed to update program course ranks: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default updateProgramCourseRanks;
