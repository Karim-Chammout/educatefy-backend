import { Knex } from 'knex';

import { Program, ProgramVersionStatusType } from '../../types/db-generated-types';
import { ContextType } from '../../types/types';

export const attachProgramToEnrollment = async (
  transaction: Knex.Transaction,
  loaders: ContextType['loaders'],
  userId: number,
  enrollmentId: number,
  programSlug: string,
) => {
  const program = await loaders.Program.loadBySlug(programSlug);

  if (program) {
    const programEnrollment = await loaders.AccountProgram.loadByAccountIdAndProgramId(
      userId,
      program.id,
    );

    if (programEnrollment) {
      await transaction('enrollment')
        .where({ id: enrollmentId })
        .update({ program_id: program.id });
    }
  }
};

export const hasValidProgramVersion = async (
  programId: number,
  user: ContextType['user'],
  loaders: ContextType['loaders'],
) => {
  const programVersions = await loaders.ProgramVersion.loadByProgramId(programId);

  if (user.authenticated) {
    const programEnrollment = await loaders.AccountProgram.loadByAccountIdAndProgramId(
      user.id,
      programId,
    );

    if (programEnrollment) {
      return programVersions.some(
        (version) =>
          version.id === programEnrollment.program_version_id &&
          (version.status === ProgramVersionStatusType.Published ||
            version.status === ProgramVersionStatusType.Archived),
      );
    }
  }

  return programVersions.some((version) => version.status === ProgramVersionStatusType.Published);
};

export const filterProgramsWithValidVersions = async (
  programs: readonly Program[],
  user: ContextType['user'],
  loaders: ContextType['loaders'],
) => {
  if (!programs || programs.length === 0) {
    return [];
  }

  const programsWithValidVersions = await Promise.all(
    programs.map(async (program) => {
      const hasValidVersion = await hasValidProgramVersion(program.id, user, loaders);

      return hasValidVersion ? program : null;
    }),
  );

  return programsWithValidVersions.filter((program) => program !== null);
};
