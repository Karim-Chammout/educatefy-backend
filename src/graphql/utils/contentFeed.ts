import { GraphQLError } from 'graphql';
import type { Knex } from 'knex';

import { EnrollmentStatusType, ProgramVersionStatusType } from '../../types/db-generated-types.js';
import { ErrorType } from '../../utils/ErrorType.js';

export const CONTENT_MAX_PAGE_SIZE = 50;

export type ContentRow = {
  kind: 'course' | 'program';
  id: number;
  created_at: Date | string;
} & Record<string, unknown>;

const KIND_RANK = { course: 0, program: 1 };

const toTimestamp = (value: Date | string): number => {
  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export function assertBoundedInt(value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new GraphQLError(ErrorType.BAD_USER_INPUT, {
      extensions: {
        code: ErrorType.BAD_USER_INPUT,
        http: { status: 400 },
      },
    });
  }
}

export function assertContentPagination(first: number, offset: number): void {
  assertBoundedInt(first, 1, CONTENT_MAX_PAGE_SIZE);
  assertBoundedInt(offset, 0, Number.MAX_SAFE_INTEGER);
}

/** `created_at DESC`, then Course before Program, then `id DESC`. */
export function mergeContentRows(
  rows: ReadonlyArray<ContentRow>,
  offset: number,
  first: number,
): ContentRow[] {
  return [...rows]
    .sort((a, b) => {
      const byDate = toTimestamp(b.created_at) - toTimestamp(a.created_at);

      if (byDate !== 0) {
        return byDate;
      }

      const byKind = KIND_RANK[a.kind] - KIND_RANK[b.kind];

      if (byKind !== 0) {
        return byKind;
      }

      return Number(b.id) - Number(a.id);
    })
    .slice(offset, offset + first);
}

export function applyPublishedCourseScope<QB extends Knex.QueryBuilder>(qb: QB): QB {
  return qb.where('c.is_published', true).whereNull('c.deleted_at') as QB;
}

export function applyPublishedProgramScope<QB extends Knex.QueryBuilder>(qb: QB): QB {
  return qb
    .where('p.is_published', true)
    .whereNull('p.deleted_at')
    .whereExists((builder) =>
      builder
        .select(1)
        .from('program_version as pv')
        .whereRaw('pv.program_id = p.id')
        .where('pv.status', ProgramVersionStatusType.Published),
    ) as QB;
}

export function excludeEnrolledCourses<QB extends Knex.QueryBuilder>(
  qb: QB,
  accountId: number,
): QB {
  return qb.whereNotExists((builder) =>
    builder
      .select(1)
      .from('enrollment as e')
      .whereRaw('e.course_id = c.id')
      .where('e.account_id', accountId)
      .whereIn('e.status', [EnrollmentStatusType.Enrolled, EnrollmentStatusType.Completed]),
  ) as QB;
}

export function excludeEnrolledPrograms<QB extends Knex.QueryBuilder>(
  qb: QB,
  accountId: number,
): QB {
  return qb.whereNotExists((builder) =>
    builder
      .select(1)
      .from('account__program as ap')
      .whereRaw('ap.program_id = p.id')
      .where('ap.account_id', accountId)
      .whereNull('ap.deleted_at'),
  ) as QB;
}

const readCount = (row: unknown): number =>
  Number((row as { total?: string | number } | undefined)?.total) || 0;

/** Tags raw query rows with the `kind` of the table they came from, so the two sources can be merged. */
export function toContentRows(rows: unknown, kind: ContentRow['kind']): ContentRow[] {
  return (rows as Array<Record<string, unknown>>).map((row) => ({ ...row, kind }) as ContentRow);
}

export type TeacherContentPage = {
  items: ContentRow[];
  totalCount: number;
};

export function assertTeacherContentPagination(first: number, offset: number): void {
  assertContentPagination(first, offset);
}

export async function getTeacherContentPage(
  db: Knex,
  teacherId: number,
  { first, offset, kind }: { first: number; offset: number; kind?: unknown },
): Promise<TeacherContentPage> {
  const filter = kind === 'course' || kind === 'program' ? kind : null;

  const coursesOf = () =>
    applyPublishedCourseScope(db('course as c').select('c.*').where('c.teacher_id', teacherId));

  const programsOf = () =>
    applyPublishedProgramScope(db('program as p').select('p.*').where('p.teacher_id', teacherId));

  // Both sources are read up to the end of the requested page, so a type-dense source
  // cannot hide valid global results on the other side of the merge.
  const candidateLimit = offset + first;

  const [courses, programs, coursesCount, programsCount] = await Promise.all([
    filter !== 'program'
      ? coursesOf().orderByRaw('c.created_at DESC, c.id DESC').limit(candidateLimit)
      : Promise.resolve([]),
    filter !== 'course'
      ? programsOf().orderByRaw('p.created_at DESC, p.id DESC').limit(candidateLimit)
      : Promise.resolve([]),
    filter !== 'program'
      ? coursesOf().clear('select').count({ total: '*' }).first()
      : Promise.resolve(),
    filter !== 'course'
      ? programsOf().clear('select').count({ total: '*' }).first()
      : Promise.resolve(),
  ]);

  return {
    items: mergeContentRows(
      [...toContentRows(courses, 'course'), ...toContentRows(programs, 'program')],
      offset,
      first,
    ),
    totalCount: readCount(coursesCount) + readCount(programsCount),
  };
}
