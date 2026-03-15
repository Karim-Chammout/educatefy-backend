import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ProgramProgressStatusType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { UpdateProgramStatusResult } from '../types/UpdateProgramStatusResult';

const unenrollFromProgram: GraphQLFieldConfig<null, ContextType> = {
  type: UpdateProgramStatusResult,
  description: 'Unenrolls an account from a program.',
  args: {
    programId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program to unenroll from.',
    },
  },
  resolve: authenticated(async (_, { programId }: { programId: string }, { db, loaders, user }) => {
    try {
      const parsedProgramId = parseInt(programId, 10);

      const enrollment = await db('account__program')
        .where({
          account_id: user.id,
          program_id: parsedProgramId,
          deleted_at: null,
        })
        .first();

      if (!enrollment) {
        return {
          success: false,
          errors: [new Error(ErrorType.NO_ENROLLMENT_FOUND)],
          program: null,
        };
      }

      await db('account__program').where('id', enrollment.id).update({
        deleted_at: db.fn.now(),
      });

      await db('program_progress').where('account__program_id', enrollment.id).update({
        status: ProgramProgressStatusType.Unenrolled,
      });

      loaders.Program.loaders.byIdLoader.clear(parsedProgramId);
      const program = await loaders.Program.loadById(parsedProgramId);

      return {
        success: true,
        errors: [],
        program,
      };
    } catch (error) {
      console.log('Failed to unenroll from program: ', error);
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        program: null,
      };
    }
  }),
};

export default unenrollFromProgram;
