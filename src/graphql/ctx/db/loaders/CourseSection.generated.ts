// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `CourseSection.ts` in this directory
// and extend `CourseSectionBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseSection as CourseSectionType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class CourseSectionBase {
  private byIdLoader: DataLoader<number, CourseSectionType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseSectionType>>;

  loadAll: () => Promise<ReadonlyArray<CourseSectionType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db
        .table('course_section')
        .whereIn('id', ids)
        .whereNull('deleted_at')
        .select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db
        .table('course_section')
        .whereIn('course_id', courseIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
    });

    this.loadAll = async () => {
      const result = await db.table('course_section').whereNull('deleted_at').select();

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
    };
  }

  /** Load a single CourseSection by its primary key */
  loadById(id: number): Promise<CourseSectionType> {
    return this.byIdLoader.load(id);
  }

  /** Load many CourseSection records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseSectionType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all CourseSection records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<CourseSectionType>> {
    return this.byCourseIdLoader.load(courseId);
  }
}
