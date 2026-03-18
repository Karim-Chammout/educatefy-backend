// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `CourseObjective.ts` in this directory
// and extend `CourseObjectiveBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseObjective as CourseObjectiveType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class CourseObjectiveBase {
  private byIdLoader: DataLoader<number, CourseObjectiveType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseObjectiveType>>;

  loadAll: () => Promise<ReadonlyArray<CourseObjectiveType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('course_objective').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db.table('course_objective').whereIn('course_id', courseIds).select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
    });

    this.loadAll = async () => {
      const result = await db.table('course_objective').select();

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

  /** Load a single CourseObjective by its primary key */
  loadById(id: number): Promise<CourseObjectiveType> {
    return this.byIdLoader.load(id);
  }

  /** Load many CourseObjective records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseObjectiveType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all CourseObjective records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<CourseObjectiveType>> {
    return this.byCourseIdLoader.load(courseId);
  }
}
