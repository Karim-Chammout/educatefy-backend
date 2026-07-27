import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { ProgramVersionStatusType } from '../../../types/db-generated-types.js';
import {
  ProgramInfoInput as ProgramInfoInputType,
  ProgramLevel,
} from '../../../types/schema-types.js';
import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import { hasTeacherRole } from '../../utils/hasTeacherRole.js';
import { isValidSlug } from '../../utils/isValidSlug.js';
import logger from '../../../utils/logger.js';
import ProgramInfoInput from '../inputs/ProgramInfo.js';
import { CreateOrUpdateProgramResult } from '../types/CreateOrUpdateProgramResult.js';

const createProgram: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateProgramResult,
  description: 'Creates a program.',
  args: {
    programInfo: {
      type: new GraphQLNonNull(ProgramInfoInput),
      description: 'The program information',
    },
  },
  resolve: authenticated(
    async (_, { programInfo }: { programInfo: ProgramInfoInputType }, { db, loaders, user }) => {
      const {
        denomination,
        description,
        slug,
        level,
        is_published,
        subtitle,
        image,
        subjectIds,
        objectives,
        requirements,
      } = programInfo;

      if (
        !denomination ||
        !slug ||
        !description ||
        !subtitle ||
        !Object.values(ProgramLevel).includes(level)
      ) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          program: null,
        };
      }

      const lowercaseSlug = slug.toLowerCase();

      if (!isValidSlug(lowercaseSlug)) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_SLUG)],
          program: null,
        };
      }

      const existingProgramBySlug = await loaders.Program.loadBySlug(lowercaseSlug);

      if (existingProgramBySlug) {
        return {
          success: false,
          errors: [new Error(ErrorType.SLUG_ALREADY_TAKEN)],
          program: null,
        };
      }

      try {
        const isTeacher = await hasTeacherRole(loaders, user.roleId);

        if (!isTeacher) {
          return {
            success: false,
            errors: [new Error(ErrorType.PERMISSION_DENIED)],
            program: null,
          };
        }

        const filteredProgramInfo = {
          denomination,
          slug: lowercaseSlug,
          description,
          subtitle,
          level,
          is_published,
          ...(image && { image }),
          teacher_id: user.id,
        };

        const createdProgram = await db.transaction(async (transaction) => {
          const [program] = await transaction('program')
            .insert(filteredProgramInfo)
            .returning('id');

          // Create the initial draft version atomically with the program
          await transaction('program_version').insert({
            program_id: program.id,
            version_number: 1,
            status: ProgramVersionStatusType.Draft,
          });

          if (subjectIds && subjectIds.length > 0) {
            // Verify that all subject IDs exist
            const subjects = await transaction('subject').whereIn('id', subjectIds);
            if (subjects.length !== subjectIds.length) {
              return {
                success: false,
                errors: [new Error(ErrorType.INVALID_SUBJECTS)],
                program: null,
              };
            }

            for (const subjectId of subjectIds) {
              await transaction('program__subject').insert({
                program_id: program.id,
                subject_id: subjectId,
              });
            }
          }

          if (objectives && objectives.length > 0) {
            for (const objective of objectives) {
              await transaction('program_objective').insert({
                program_id: program.id,
                objective: objective,
              });
            }
          }

          if (requirements && requirements.length > 0) {
            for (const requirement of requirements) {
              await transaction('program_requirement').insert({
                program_id: program.id,
                requirement: requirement,
              });
            }
          }

          return program;
        });

        return {
          success: true,
          errors: [],
          program: createdProgram,
        };
      } catch (error) {
        logger.error({ err: error, userId: user.id }, 'Failed to create program');
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          program: null,
        };
      }
    },
  ),
};

export default createProgram;
