import { Knex } from 'knex';

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
