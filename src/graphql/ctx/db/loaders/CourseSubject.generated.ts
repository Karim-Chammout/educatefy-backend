// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `CourseSubject.ts` in this directory
// and extend `CourseSubjectBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseSubject as CourseSubjectType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class CourseSubjectBase {
  private byIdLoader: DataLoader<number, CourseSubjectType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseSubjectType>>;

  private bySubjectIdLoader: DataLoader<number, ReadonlyArray<CourseSubjectType>>;

  loadAll: () => Promise<ReadonlyArray<CourseSubjectType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('course__subject').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db.table('course__subject').whereIn('course_id', courseIds).select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
    });

    this.bySubjectIdLoader = new DataLoader(async (subjectIds) => {
      if (subjectIds.length === 0) return [];

      const rows = await db.table('course__subject').whereIn('subject_id', subjectIds).select();

      return mapToMany(subjectIds, rows, (r) => r.subject_id);
    });

    this.loadAll = async () => {
      const result = await db.table('course__subject').select();

      for (const row of result) {
        this.byIdLoader.prime(row.id, row);
      }

      return result;
    };
  }

  /**
   * Exposes the underlying DataLoader instances so callers can prime or
   * clear the cache directly when needed.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byCourseIdLoader: this.byCourseIdLoader,
      bySubjectIdLoader: this.bySubjectIdLoader,
    };
  }

  /** Load a single CourseSubject by its primary key */
  loadById(id: number): Promise<CourseSubjectType> {
    return this.byIdLoader.load(id);
  }

  /** Load many CourseSubject records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseSubjectType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all CourseSubject records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<CourseSubjectType>> {
    return this.byCourseIdLoader.load(courseId);
  }

  /** Load all CourseSubject records with subject_id = `subjectId` */
  loadBySubjectId(subjectId: number): Promise<ReadonlyArray<CourseSubjectType>> {
    return this.bySubjectIdLoader.load(subjectId);
  }
}
