// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `CourseRating.ts` in this directory
// and extend `CourseRatingBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseRating as CourseRatingType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class CourseRatingBase {
  private byIdLoader: DataLoader<number, CourseRatingType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<CourseRatingType>>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseRatingType>>;

  loadAll: () => Promise<ReadonlyArray<CourseRatingType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('course_rating').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db.table('course_rating').whereIn('account_id', accountIds).select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db.table('course_rating').whereIn('course_id', courseIds).select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
    });

    this.loadAll = async () => {
      const result = await db.table('course_rating').select();

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
      byAccountIdLoader: this.byAccountIdLoader,
      byCourseIdLoader: this.byCourseIdLoader,
    };
  }

  /** Load a single CourseRating by its primary key */
  loadById(id: number): Promise<CourseRatingType> {
    return this.byIdLoader.load(id);
  }

  /** Load many CourseRating records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseRatingType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all CourseRating records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<CourseRatingType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  /** Load all CourseRating records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<CourseRatingType>> {
    return this.byCourseIdLoader.load(courseId);
  }
}
