import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { UpdateProgramStatusResult } from '../types/UpdateProgramStatusResult.js';
import logger from '../../../utils/logger.js';

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

      const enrollment = await loaders.AccountProgram.loadByAccountIdAndProgramId(
        user.id,
        parsedProgramId,
      );

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

      loaders.Program.loaders.byIdLoader.clear(parsedProgramId);
      const program = await loaders.Program.loadById(parsedProgramId);

      return {
        success: true,
        errors: [],
        program,
      };
    } catch (error) {
      logger.error({ err: error, userId: user.id }, 'Failed to unenroll from program');
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        program: null,
      };
    }
  }),
};

export default unenrollFromProgram;
