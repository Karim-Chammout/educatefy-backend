import { GraphQLFieldConfig, GraphQLNonNull } from 'graphql';

import { Course as CourseType, ProgramVersionStatusType } from '../../../types/db-generated-types';
import { UpdateProgramVersionCoursesInput as UpdateProgramVersionCoursesInputType } from '../../../types/schema-types';
import { ContextType } from '../../../types/types';
import { ErrorType } from '../../../utils/ErrorType';
import { authenticated } from '../../utils/auth';
import UpdateProgramVersionCoursesInput from '../inputs/UpdateProgramVersionCourses';
import { UpdateProgramVersionCoursesResult } from '../types/UpdateProgramVersionCoursesResult';

const updateProgramVersionCourses: GraphQLFieldConfig<null, ContextType> = {
  type: UpdateProgramVersionCoursesResult,
  description: 'Updates the courses linked to the current draft version of a program.',
  args: {
    updateProgramVersionCoursesInfo: {
      type: new GraphQLNonNull(UpdateProgramVersionCoursesInput),
      description: 'The program version courses information to be updated.',
    },
  },
  resolve: authenticated(
    async (
      _,
      {
        updateProgramVersionCoursesInfo,
      }: { updateProgramVersionCoursesInfo: UpdateProgramVersionCoursesInputType },
      { db, loaders, user },
    ) => {
      const { programId, courses } = updateProgramVersionCoursesInfo;

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
            errors: [new Error(ErrorType.NOT_FOUND)],
            programVersion: null,
          };
        }

        const updatedProgramVersion = await db.transaction(async (transaction) => {
          if (!courses || courses.length === 0) {
            await transaction('course__program_version')
              .where('program_version_id', draftVersion.id)
              .del();

            return draftVersion;
          }

          const parsedCourseIds = courses
            .map((c) => parseInt(c.courseId, 10))
            .filter((id) => !isNaN(id));

          // Verify all courses exist and belong to the teacher
          const validCourses = await transaction<CourseType>('course')
            .whereIn('id', parsedCourseIds)
            .where('teacher_id', user.id)
            .whereNull('deleted_at')
            .select();

          if (!validCourses || validCourses.length !== parsedCourseIds.length) {
            return {
              success: false,
              errors: [new Error(ErrorType.INVALID_COURSE_LINKING)],
              programVersion: null,
            };
          }

          // Validate that prerequisite_course_ids, if provided, are part of
          // the incoming course list — a prerequisite must exist in the same version
          const incomingCourseIdSet = new Set(parsedCourseIds);

          for (const courseEntry of courses) {
            if (courseEntry.prerequisiteCourseId) {
              const parsedPrerequisiteId = Number(courseEntry.prerequisiteCourseId);

              if (!incomingCourseIdSet.has(parsedPrerequisiteId)) {
                return {
                  success: false,
                  errors: [new Error(ErrorType.INVALID_PREREQUISITE)],
                  programVersion: null,
                };
              }
            }
          }

          // Cycle detection — build an adjacency map and check for cycles
          // to prevent deadlocks (course A requires B, course B requires A)
          const prerequisiteMap = new Map<number, number>();
          for (const courseEntry of courses) {
            if (courseEntry.prerequisiteCourseId) {
              const courseId = Number(courseEntry.courseId);
              const prerequisiteId = Number(courseEntry.prerequisiteCourseId);
              prerequisiteMap.set(courseId, prerequisiteId);
            }
          }

          const hasCycle = (): boolean => {
            const visited = new Set<number>();
            const inStack = new Set<number>();

            const dfs = (courseId: number): boolean => {
              if (inStack.has(courseId)) return true;
              if (visited.has(courseId)) return false;

              visited.add(courseId);
              inStack.add(courseId);

              const prerequisite = prerequisiteMap.get(courseId);
              if (prerequisite !== undefined && dfs(prerequisite)) return true;

              inStack.delete(courseId);
              return false;
            };

            for (const courseId of prerequisiteMap.keys()) {
              if (dfs(courseId)) return true;
            }

            return false;
          };

          if (hasCycle()) {
            return {
              success: false,
              errors: [new Error(ErrorType.PREREQUISITE_CYCLE_DETECTED)],
              programVersion: null,
            };
          }

          // Full replace — delete existing links and re-insert with updated ranks and prerequisites.
          await transaction('course__program_version')
            .where('program_version_id', draftVersion.id)
            .del();

          for (const courseEntry of courses) {
            const courseId = Number(courseEntry.courseId);
            const prerequisiteCourseId = courseEntry.prerequisiteCourseId
              ? Number(courseEntry.prerequisiteCourseId)
              : null;

            await transaction('course__program_version').insert({
              program_version_id: draftVersion.id,
              course_id: courseId,
              rank: courseEntry.rank,
              prerequisite_course_id: prerequisiteCourseId,
            });
          }

          return draftVersion;
        });

        return {
          success: true,
          errors: [],
          programVersion: updatedProgramVersion,
        };
      } catch (error) {
        console.log('Failed to update program version courses: ', error);
        return {
          success: false,
          errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
          programVersion: null,
        };
      }
    },
  ),
};

export default updateProgramVersionCourses;
