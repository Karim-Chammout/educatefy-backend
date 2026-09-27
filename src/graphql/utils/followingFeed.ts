import type { Knex } from 'knex';

import {
  ContentRow,
  applyPublishedCourseScope,
  applyPublishedProgramScope,
  assertBoundedInt,
  excludeEnrolledCourses,
  excludeEnrolledPrograms,
  mergeContentRows,
  toContentRows,
} from './contentFeed.js';

export const FOLLOWING_FEED_MAX_ITEMS_PER_TEACHERS = 8;
export const FOLLOWING_FEED_MAX_TEACHERS = 20;

export type FollowedTeacherContent = {
  teacherId: number;
  items: ContentRow[];
  totalCount: number;
};

type TeacherRow = {
  teacher_id: number;
  newest?: Date | string;
  total?: string | number;
};

export function assertFollowingFeedByTeachersArgs(
  teachersFirst: number,
  maxTeachers: number,
): void {
  assertBoundedInt(teachersFirst, 1, FOLLOWING_FEED_MAX_ITEMS_PER_TEACHERS);
  assertBoundedInt(maxTeachers, 1, FOLLOWING_FEED_MAX_TEACHERS);
}

// EXISTS rather than a join, so a duplicated follow row cannot multiply content rows.
const followExists = (qb: Knex.QueryBuilder, accountId: number, owner: string) =>
  qb.whereExists((builder) =>
    builder
      .select(1)
      .from('student_teacher_follow as stf')
      .whereRaw(`stf.teacher_id = ${owner}`)
      .where('stf.student_id', accountId)
      .where('stf.is_following', true),
  );

export function followedContentCourses(db: Knex, accountId: number): Knex.QueryBuilder {
  return excludeEnrolledCourses(
    followExists(
      applyPublishedCourseScope(db('course as c').select('c.*')),
      accountId,
      'c.teacher_id',
    ),
    accountId,
  );
}

export function followedContentPrograms(db: Knex, accountId: number): Knex.QueryBuilder {
  return excludeEnrolledPrograms(
    followExists(
      applyPublishedProgramScope(db('program as p').select('p.*')),
      accountId,
      'p.teacher_id',
    ),
    accountId,
  );
}

/** Newest item per followed teacher, newest teacher first. Teachers owning both content
 * types arrive from both sources and are collapsed, otherwise one teacher would take two
 * slots of the bounded list. */
function rankFollowedTeachers(rows: TeacherRow[], maxTeachers: number): number[] {
  const newestByTeacher = new Map<number, number>();

  for (const row of rows) {
    const teacherId = Number(row.teacher_id);

    newestByTeacher.set(
      teacherId,
      Math.max(newestByTeacher.get(teacherId) ?? 0, new Date(row.newest ?? 0).getTime() || 0),
    );
  }

  return [...newestByTeacher.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, maxTeachers)
    .map(([teacherId]) => teacherId);
}

export async function getFollowingFeedByTeachers(
  db: Knex,
  accountId: number,
  { teachersFirst, maxTeachers }: { teachersFirst: number; maxTeachers: number },
): Promise<FollowedTeacherContent[]> {
  const rankedBy = (owner: string) =>
    (owner === 'c' ? followedContentCourses(db, accountId) : followedContentPrograms(db, accountId))
      .clear('select')
      .select(`${owner}.teacher_id`)
      .max({ newest: `${owner}.created_at` })
      .groupBy(`${owner}.teacher_id`)
      .orderByRaw(`newest DESC, ${owner}.teacher_id ASC`)
      .limit(maxTeachers);

  const rankedTeacherIds = rankFollowedTeachers(
    [...((await rankedBy('c')) as TeacherRow[]), ...((await rankedBy('p')) as TeacherRow[])],
    maxTeachers,
  );

  if (rankedTeacherIds.length === 0) {
    return [];
  }

  // With only `maxTeachers` teachers of interest, the newest `maxTeachers * teachersFirst`
  // rows of a content type always contain the newest `teachersFirst` rows of each of them.
  const candidateLimit = rankedTeacherIds.length * teachersFirst;

  const [courses, programs, courseCounts, programCounts] = await Promise.all([
    followedContentCourses(db, accountId)
      .whereIn('c.teacher_id', rankedTeacherIds)
      .orderByRaw('c.created_at DESC, c.id DESC')
      .limit(candidateLimit),
    followedContentPrograms(db, accountId)
      .whereIn('p.teacher_id', rankedTeacherIds)
      .orderByRaw('p.created_at DESC, p.id DESC')
      .limit(candidateLimit),
    followedContentCourses(db, accountId)
      .whereIn('c.teacher_id', rankedTeacherIds)
      .clear('select')
      .select('c.teacher_id')
      .count({ total: '*' })
      .groupBy('c.teacher_id'),
    followedContentPrograms(db, accountId)
      .whereIn('p.teacher_id', rankedTeacherIds)
      .clear('select')
      .select('p.teacher_id')
      .count({ total: '*' })
      .groupBy('p.teacher_id'),
  ]);

  const itemsByTeacher = new Map<number, ContentRow[]>(rankedTeacherIds.map((id) => [id, []]));
  const totals = new Map<number, number>(rankedTeacherIds.map((id) => [id, 0]));

  const collect = (rows: unknown, kind: ContentRow['kind']) => {
    for (const row of toContentRows(rows, kind)) {
      const teacherId = Number(row.teacher_id);

      itemsByTeacher.get(teacherId)?.push(row);
    }
  };

  collect(courses, 'course');
  collect(programs, 'program');

  for (const row of [...courseCounts, ...programCounts] as TeacherRow[]) {
    const teacherId = Number(row.teacher_id);

    totals.set(teacherId, (totals.get(teacherId) ?? 0) + (Number(row.total) || 0));
  }

  return rankedTeacherIds.map((teacherId) => ({
    teacherId,
    items: mergeContentRows(itemsByTeacher.get(teacherId) ?? [], 0, teachersFirst),
    totalCount: totals.get(teacherId) ?? 0,
  }));
}
