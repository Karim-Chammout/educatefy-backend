import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import logger from '../../../utils/logger.js';
import MutationResult from '../types/MutationResult.js';

const deleteProgram: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Deletes a program.',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program to delete.',
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
      const programId = parseInt(id, 10);
      const program = await loaders.Program.loadById(programId);

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

      await db('program').where('id', program.id).update({
        deleted_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      // Clear the loader cache for this program
      loaders.Program.loaders.byIdLoader.clear(program.id);

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      logger.error({ err: error, userId: user.id }, 'Failed to delete program');
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
      };
    }
  }),
};

export default deleteProgram;
