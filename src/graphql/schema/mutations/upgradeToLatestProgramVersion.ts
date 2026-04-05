import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ProgramVersionStatusType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { UpgradeToLatestProgramVersionResult } from '../types/UpgradeToLatestProgramVersionResult';

const upgradeToLatestProgramVersion: GraphQLFieldConfig<null, ContextType> = {
  type: UpgradeToLatestProgramVersionResult,
  description:
    'Upgrades an enrolled student to the latest published version of a program, preserving all existing course enrollment records.',
  args: {
    programId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program to upgrade to the latest version for.',
    },
  },
  resolve: authenticated(async (_, { programId }: { programId: string }, { db, loaders, user }) => {
    try {
      const parsedProgramId = parseInt(programId, 10);

      const program = await loaders.Program.loadById(parsedProgramId);

      if (!program) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
          program: null,
        };
      }

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

      const latestPublishedVersion = await db('program_version')
        .where('program_id', parsedProgramId)
        .where('status', ProgramVersionStatusType.Published)
        .orderBy('version_number', 'desc')
        .first();

      if (!latestPublishedVersion) {
        return {
          success: false,
          errors: [new Error(ErrorType.NO_PUBLISHED_PROGRAM_VERSION_FOUND)],
          program: null,
        };
      }

      if (enrollment.program_version_id === latestPublishedVersion.id) {
        return {
          success: false,
          errors: [new Error(ErrorType.ALREADY_ON_LATEST_VERSION)],
          program: null,
        };
      }

      await db('account__program').where('id', enrollment.id).update({
        program_version_id: latestPublishedVersion.id,
        updated_at: db.fn.now(),
      });

      loaders.Program.loaders.byIdLoader.clear(parsedProgramId);
      const updatedProgram = await loaders.Program.loadById(parsedProgramId);

      return {
        success: true,
        errors: [],
        program: updatedProgram,
      };
    } catch (error) {
      console.log('Failed to upgrade to latest program version: ', error);
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        program: null,
      };
    }
  }),
};

export default upgradeToLatestProgramVersion;
