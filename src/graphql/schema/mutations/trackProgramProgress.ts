import { GraphQLBoolean, GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import MutationResult from '../types/MutationResult';
import { ProgramProgressStatusType } from '../../../types/db-generated-types';

const trackProgramProgress: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Updates the last_viewed_at timestamp for a program progress.',
  args: {
    programId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program.',
    },
    shouldMarkProgramAsCompleted: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Boolean flag to check if the courses of ther program are completed or not.',
    },
  },
  resolve: authenticated(
    async (
      _,
      {
        programId,
        shouldMarkProgramAsCompleted,
      }: { programId: string; shouldMarkProgramAsCompleted: boolean },
      { db, loaders, user },
    ) => {
      try {
        const parsedProgramId = parseInt(programId, 10);

        const accountProgram = await db('account__program')
          .where({
            account_id: user.id,
            program_id: parsedProgramId,
            deleted_at: null,
          })
          .first();

        if (!accountProgram) {
          return {
            success: false,
            errors: [new Error(ErrorType.NO_ENROLLMENT_FOUND)],
          };
        }

        const programProgress = await loaders.ProgramProgress.loadByAccountProgramId(
          accountProgram.id,
        );

        if (programProgress.status !== ProgramProgressStatusType.Completed) {
          await db('program_progress')
            .where('account__program_id', accountProgram.id)
            .update({
              last_viewed_at: db.fn.now(),
              ...(shouldMarkProgramAsCompleted && {
                status: ProgramProgressStatusType.Completed,
                completed_at: db.fn.now(),
              }),
            });
        }

        return {
          success: true,
          errors: [],
        };
      } catch (error) {
        console.log('Failed to update last_viewed_at: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        };
      }
    },
  ),
};

export default trackProgramProgress;
