import { GraphQLFieldConfig, GraphQLID, GraphQLNonNull } from 'graphql';

import { ProgramVersionStatusType } from '../../../types/db-generated-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import { CreateProgramVersionResult } from '../types/CreateProgramVersionResult';

const createProgramVersion: GraphQLFieldConfig<null, ContextType> = {
  type: CreateProgramVersionResult,
  description:
    'Creates a new draft version of a program, copying the course list from the latest published version.',
  args: {
    programId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the program to create a new version for.',
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

      // Only one draft can exist at a time — reject if one already exists
      const existingDraft = await db('program_version')
        .where('program_id', parsedProgramId)
        .where('status', ProgramVersionStatusType.Draft)
        .first();

      if (existingDraft) {
        return {
          success: false,
          errors: [new Error(ErrorType.DRAFT_ALREADY_EXISTS)],
          programVersion: null,
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
          programVersion: null,
        };
      }

      const newProgramVersion = await db.transaction(async (transaction) => {
        // Insert the new draft version with an incremented version number
        const [programVersion] = await transaction('program_version')
          .insert({
            program_id: parsedProgramId,
            version_number: latestPublishedVersion.version_number + 1,
            status: ProgramVersionStatusType.Draft,
          })
          .returning('*');

        // Copy the course list from the latest published version
        const existingCourseLinks = await transaction('course__program_version').where(
          'program_version_id',
          latestPublishedVersion.id,
        );

        if (existingCourseLinks.length > 0) {
          await transaction('course__program_version').insert(
            existingCourseLinks.map((link) => ({
              program_version_id: programVersion.id,
              course_id: link.course_id,
              rank: link.rank,
              prerequisite_course_id: link.prerequisite_course_id,
            })),
          );
        }

        return programVersion;
      });

      return {
        success: true,
        errors: [],
        programVersion: newProgramVersion,
      };
    } catch (error) {
      console.log('Failed to create program version: ', error);
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
        programVersion: null,
      };
    }
  }),
};

export default createProgramVersion;
