import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ProgramProgressStatusType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { UpdateProgramStatusResult } from '../types/UpdateProgramStatusResult';

const enrollInProgram: GraphQLFieldConfig<null, ContextType> = {
  type: UpdateProgramStatusResult,
  description: 'Enrolls an account in a program.',
  args: {
    programId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program to enroll in.',
    },
  },
  resolve: authenticated(async (_, { programId }: { programId: string }, { db, loaders, user }) => {
    try {
      const parsedProgramId = parseInt(programId, 10);

      const existingEnrollment = await db('account__program')
        .where({
          account_id: user.id,
          program_id: parsedProgramId,
          deleted_at: null,
        })
        .first();

      if (existingEnrollment) {
        return {
          success: false,
          errors: [new Error(ErrorType.ALREADY_ENROLLED)],
          program: null,
        };
      }

      await db.transaction(async (transaction) => {
        const [enrollment] = await transaction('account__program')
          .insert({
            account_id: user.id,
            program_id: parsedProgramId,
          })
          .returning('id');

        // Create progress record
        await transaction('program_progress').insert({
          account__program_id: enrollment.id,
          status: ProgramProgressStatusType.InProgress,
          started_at: db.fn.now(),
          last_viewed_at: db.fn.now(),
        });
      });

      loaders.Program.loaders.byIdLoader.clear(parsedProgramId);
      const program = await loaders.Program.loadById(parsedProgramId);

      return {
        success: true,
        errors: [],
        program,
      };
    } catch (error) {
      console.log('Failed to enroll in program: ', error);
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        program: null,
      };
    }
  }),
};

export default enrollInProgram;
