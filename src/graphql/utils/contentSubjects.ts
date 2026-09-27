import type { Knex } from 'knex';

import { ErrorType } from '../../utils/ErrorType.js';
import logger from '../../utils/logger.js';

export const MIN_CONTENT_SUBJECTS = 1;

export type ContentSubjectKind = 'course' | 'program';

const JOIN_TABLES: Record<ContentSubjectKind, { table: string; foreignKey: string }> = {
  course: { table: 'course__subject', foreignKey: 'course_id' },
  program: { table: 'program__subject', foreignKey: 'program_id' },
};

export type ValidateContentSubjectsResult =
  | { success: true; subjectIds: number[] }
  | { success: false; error: ErrorType; detail?: string };

export function normalizeSubjectIds(
  subjectIds: ReadonlyArray<string | number> | null | undefined,
): number[] {
  if (!subjectIds) {
    return [];
  }

  return [
    ...new Set(
      subjectIds
        .map((id) => Number(String(id).trim()))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];
}

/**
 * Validates the subject tags of a course/program mutation. It never throws so the
 * resolvers can turn failures into mutation-result business errors.
 */
export async function validateContentSubjects(
  db: Knex,
  subjectIds: ReadonlyArray<string | number> | null | undefined,
  context: { kind: ContentSubjectKind; contentId?: number | string },
): Promise<ValidateContentSubjectsResult> {
  const normalizedIds = normalizeSubjectIds(subjectIds);

  if (normalizedIds.length < MIN_CONTENT_SUBJECTS) {
    return { success: false, error: ErrorType.MIN_CONTENT_SUBJECTS_REQUIRED };
  }

  const foundSubjects = await db('subject').whereIn('id', normalizedIds).select('id');
  const foundIds = new Set(foundSubjects.map((subject) => Number(subject.id)));
  const missingIds = normalizedIds.filter((id) => !foundIds.has(id));

  if (missingIds.length > 0) {
    logger.warn({ ...context, missingIds }, 'Content subjects contain unknown subject ids');

    return {
      success: false,
      error: ErrorType.INVALID_SUBJECTS,
      detail: `Unknown subject ids: ${missingIds.join(', ')}`,
    };
  }

  return { success: true, subjectIds: normalizedIds };
}

const isSameSubjectSet = (
  existingIds: ReadonlyArray<number>,
  requestedIds: ReadonlyArray<number>,
) => {
  if (existingIds.length !== requestedIds.length) {
    return false;
  }

  const existing = new Set(existingIds);

  return requestedIds.every((id) => existing.has(id));
};

/**
 * Replaces the subject tags of a course/program inside the caller's transaction.
 */
export async function replaceContentSubjects(
  transaction: Knex.Transaction,
  kind: ContentSubjectKind,
  contentId: number,
  subjectIds: ReadonlyArray<number>,
): Promise<void> {
  const { table, foreignKey } = JOIN_TABLES[kind];

  const existingRows = await transaction(table).where(foreignKey, contentId).select('subject_id');
  const existingIds = existingRows.map((row) => Number(row.subject_id));

  if (isSameSubjectSet(existingIds, subjectIds)) {
    return;
  }

  await transaction(table).where(foreignKey, contentId).del();
  await transaction(table).insert(
    subjectIds.map((subjectId) => ({ [foreignKey]: contentId, subject_id: subjectId })),
  );
}
