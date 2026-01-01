import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';
import { isEqual } from 'lodash';

import {
  ProgramLevel,
  UpdateProgramInfoInput as UpdateProgramInfoInputType,
} from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { sanitizeText } from '../../../utils/sanitizeText';
import { authenticated } from '../../utils/auth';
import { isValidSlug } from '../../utils/isValidSlug';
import UpdateProgramInfoInput from '../inputs/UpdateProgramInfo';
import { CreateOrUpdateProgramResult } from '../types/CreateOrUpdateProgramResult';

const updateProgram: GraphQLFieldConfig<null, ContextType> = {
  type: CreateOrUpdateProgramResult,
  description: 'Updates a program.',
  args: {
    updateProgramInfo: {
      type: new GraphQLNonNull(UpdateProgramInfoInput),
      description: 'The program information to be updated.',
    },
  },
  resolve: authenticated(
    async (
      _,
      { updateProgramInfo }: { updateProgramInfo: UpdateProgramInfoInputType },
      { db, loaders, user },
    ) => {
      const {
        id,
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
      } = updateProgramInfo;

      if (!id || (level && !Object.values(ProgramLevel).includes(level))) {
        return {
          success: false,
          errors: [new Error(ErrorType.INVALID_INPUT)],
          program: null,
        };
      }

      try {
        const programId = parseInt(id, 10);

        let updatedSlug = null;
        if (slug) {
          const lowercaseSlug = slug.toLowerCase();
          if (!isValidSlug(lowercaseSlug)) {
            return {
              success: false,
              errors: [new Error(ErrorType.INVALID_SLUG)],
              program: null,
            };
          }

          const existingProgramBySlug = await loaders.Program.loadBySlug(lowercaseSlug);
          if (
            existingProgramBySlug &&
            existingProgramBySlug.id !== programId &&
            existingProgramBySlug.slug === lowercaseSlug
          ) {
            return {
              success: false,
              errors: [new Error(ErrorType.SLUG_ALREADY_TAKEN)],
              program: null,
            };
          }

          updatedSlug = lowercaseSlug;
        }

        const program = await loaders.Program.loadById(programId);

        if (!program) {
          return {
            success: false,
            errors: [new Error(ErrorType.NOT_FOUND)],
            program: null,
          };
        }

        if (program.teacher_id !== user.id) {
          return {
            success: false,
            errors: [new Error(ErrorType.FORBIDDEN)],
            program: null,
          };
        }

        const filteredUpdatedProgramInfo = {
          ...(denomination && { denomination }),
          ...(updatedSlug && { slug: updatedSlug }),
          ...(description && { description: sanitizeText(description) }),
          ...(subtitle && { subtitle }),
          ...(level && { level }),
          ...(is_published !== undefined && { is_published }),
          ...(image !== undefined && { image }),
        };

        const updatedProgram = await db.transaction(async (transaction) => {
          const [programToUpdate] = await db('program')
            .where('id', program.id)
            .update({ ...filteredUpdatedProgramInfo, updated_at: db.fn.now() })
            .returning('*');

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

            // Only update the "program__subject" table if the subject IDs have changed
            const existingSubjects = await loaders.Subject.loadByProgramId(program.id);
            const existingSubjectIds = existingSubjects.map((subject) => String(subject.id));
            if (!isEqual(subjectIds, existingSubjectIds)) {
              await transaction('program__subject').where('program_id', program.id).del();
              for (const subjectId of subjectIds) {
                await transaction('program__subject').insert({
                  program_id: program.id,
                  subject_id: subjectId,
                });
              }
            }
          }

          if (objectives && objectives.length > 0) {
            // Only update the "program_objective" table if the objectives have changed
            const existingObjectives = await loaders.ProgramObjective.loadByProgramId(program.id);
            const existingObjectiveIds = existingObjectives.map((objective) =>
              String(objective.id),
            );
            const newObjectiveIds = objectives.map((objective) => objective.id);

            if (!isEqual(existingObjectiveIds, newObjectiveIds)) {
              await transaction('program_objective').where('program_id', program.id).del();

              for (const objectiveItem of objectives) {
                await transaction('program_objective').insert({
                  program_id: program.id,
                  objective: objectiveItem.objective,
                });
              }
            }
          }

          if (requirements && requirements.length > 0) {
            // Only update the "program_requirement" table if the requirements have changed
            const existingRequirements = await loaders.ProgramRequirement.loadByProgramId(
              program.id,
            );
            const existingRequirementIds = existingRequirements.map((requirement) =>
              String(requirement.id),
            );
            const newRequirementIds = requirements.map((requirement) => requirement.id);

            if (!isEqual(existingRequirementIds, newRequirementIds)) {
              await transaction('program_requirement').where('program_id', program.id).del();

              for (const requirementItem of requirements) {
                await transaction('program_requirement').insert({
                  program_id: program.id,
                  requirement: requirementItem.requirement,
                });
              }
            }
          }

          return programToUpdate;
        });

        loaders.Program.loaders.byIdLoader.clear(program.id);

        return {
          success: true,
          errors: [],
          program: updatedProgram,
        };
      } catch (error) {
        console.log('Failed to update a program: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          program: null,
        };
      }
    },
  ),
};

export default updateProgram;
