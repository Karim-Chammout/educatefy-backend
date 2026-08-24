import type { Knex } from 'knex';

import { ErrorType } from '../../utils/ErrorType.js';
import logger from '../../utils/logger.js';

export const MIN_TEACHER_SPECIALTIES = 1;
export const MAX_TEACHER_SPECIALTIES = 3;

export type ReplaceTeacherSpecialtiesResult =
  | { success: true }
  | { success: false; error: ErrorType; detail?: string };

export const replaceTeacherSpecialties = async (
  db: Knex,
  accountId: number,
  subjectIds: Array<string | number>,
): Promise<ReplaceTeacherSpecialtiesResult> => {
  const uniqueIds = [
    ...new Set(
      subjectIds
        .map((id) => Number(String(id).trim()))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];

  if (uniqueIds.length < MIN_TEACHER_SPECIALTIES) {
    return { success: false, error: ErrorType.MIN_SUBJECTS_REQUIRED };
  }

  if (uniqueIds.length > MAX_TEACHER_SPECIALTIES) {
    return { success: false, error: ErrorType.MAX_SUBJECTS_EXCEEDED };
  }

  const foundSubjects = await db('subject').whereIn('id', uniqueIds).select('id');
  const missingIds = uniqueIds.filter((id) => !foundSubjects.some((subject) => subject.id === id));

  if (missingIds.length > 0) {
    logger.warn({ accountId, missingIds }, 'Teacher specialties contain unknown subject ids');

    return {
      success: false,
      error: ErrorType.INVALID_INPUT,
      detail: `Unknown subject ids: ${missingIds.join(', ')}`,
    };
  }

  const existingRows = await db('account__subject')
    .where('account_id', accountId)
    .select('subject_id');
  const existingIds = new Set(existingRows.map((row) => row.subject_id));
  const requestedIds = new Set(uniqueIds);

  const isSameSet =
    existingIds.size === requestedIds.size && [...requestedIds].every((id) => existingIds.has(id));

  if (isSameSet) {
    return { success: true };
  }

  await db('account__subject').where('account_id', accountId).del();
  await db('account__subject').insert(
    uniqueIds.map((subjectId) => ({ account_id: accountId, subject_id: subjectId })),
  );

  return { success: true };
};
