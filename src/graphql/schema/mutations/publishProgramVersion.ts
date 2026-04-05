import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ProgramVersionStatusType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { PublishProgramVersionResult } from '../types/PublishProgramVersionResult';

const publishProgramVersion: GraphQLFieldConfig<null, ContextType> = {
  type: PublishProgramVersionResult,
  description: 'Publishes the current draft version of a program.',
  args: {
    programId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program to publish a version for.',
    },
  },
  resolve: authenticated(async (_, { programId }: { programId: string }, { db, loaders, user }) => {
    if (!programId) {
      return {
        success: false,
        errors: [new Error(ErrorType.INVALID_INPUT)],
        programVersion: null,
      };
    }

    try {
      const parsedProgramId = parseInt(programId, 10);

      const program = await loaders.Program.loadById(parsedProgramId);

      if (!program) {
        return {
          success: false,
          errors: [new Error(ErrorType.NOT_FOUND)],
          programVersion: null,
        };
      }

      if (program.teacher_id !== user.id) {
        return {
          success: false,
          errors: [new Error(ErrorType.FORBIDDEN)],
          programVersion: null,
        };
      }

      const draftVersion = await db('program_version')
        .where('program_id', parsedProgramId)
        .where('status', ProgramVersionStatusType.Draft)
        .first();

      if (!draftVersion) {
        return {
          success: false,
          errors: [new Error(ErrorType.NO_DRAFT_PROGRAM_VERSION_FOUND)],
          programVersion: null,
        };
      }

      // A version must have at least one course before it can be published
      const courseCount = await db('course__program_version')
        .where('program_version_id', draftVersion.id)
        .count('id as count')
        .first();

      if (!courseCount || Number(courseCount.count) === 0) {
        return {
          success: false,
          errors: [new Error(ErrorType.PROGRAM_VERSION_EMPTY)],
          programVersion: null,
        };
      }

      const publishedProgramVersion = await db.transaction(async (transaction) => {
        // Archive the currently published version, if one exists
        await transaction('program_version')
          .where('program_id', parsedProgramId)
          .where('status', ProgramVersionStatusType.Published)
          .update({
            status: 'archived',
            updated_at: db.fn.now(),
          });

        // Publish the draft version
        const [programVersion] = await transaction('program_version')
          .where('id', draftVersion.id)
          .update({
            status: ProgramVersionStatusType.Published,
            published_at: db.fn.now(),
            updated_at: db.fn.now(),
          })
          .returning('*');

        return programVersion;
      });

      return {
        success: true,
        errors: [],
        programVersion: publishedProgramVersion,
      };
    } catch (error) {
      console.log('Failed to publish program version: ', error);
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        programVersion: null,
      };
    }
  }),
};

export default publishProgramVersion;
