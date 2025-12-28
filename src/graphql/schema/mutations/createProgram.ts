import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import {
  ProgramInfoInput as ProgramInfoInputType,
  ProgramLevel,
} from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { sanitizeText } from '../../../utils/sanitizeText';
import { authenticated } from '../../utils/auth';
import { hasTeacherRole } from '../../utils/hasTeacherRole';
import { isValidSlug } from '../../utils/isValidSlug';
import ProgramInfoInput from '../inputs/ProgramInfo';
import { CreateOrUpdateProgramResult } from '../types/CreateOrUpdateProgramResult';

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
          description: sanitizeText(description),
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
        console.log('Failed to create program: ', error);
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
