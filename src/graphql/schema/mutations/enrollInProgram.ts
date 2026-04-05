import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ProgramVersionStatusType } from '../../../types/db-generated-types';
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

      const program = await loaders.Program.loadById(parsedProgramId);

      if (!program || (program && !program.is_published)) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
          program: null,
        };
      }

      const existingEnrollment = await loaders.AccountProgram.loadByAccountIdAndProgramId(
        user.id,
        parsedProgramId,
      );

      if (existingEnrollment) {
        return {
          success: false,
          errors: [new Error(ErrorType.ALREADY_ENROLLED)],
          program: null,
        };
      }

      // Enroll to the latest published version
      const latestPublishedVersion = await db('program_version')
        .where('program_id', parsedProgramId)
        .where('status', ProgramVersionStatusType.Published)
        .orderBy('version_number', 'desc')
        .first();

      if (!latestPublishedVersion) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
          program: null,
        };
      }

      await db('account__program').insert({
        account_id: user.id,
        program_id: parsedProgramId,
        program_version_id: latestPublishedVersion.id,
      });

      loaders.Program.loaders.byIdLoader.clear(parsedProgramId);
      const updatedProgram = await loaders.Program.loadById(parsedProgramId);

      return {
        success: true,
        errors: [],
        program: updatedProgram,
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
