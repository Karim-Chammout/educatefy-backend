// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Enrollment.ts` in this directory
// and extend `EnrollmentBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Enrollment as EnrollmentType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class EnrollmentBase {
  private byIdLoader: DataLoader<number, EnrollmentType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<EnrollmentType>>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<EnrollmentType>>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<EnrollmentType>>;

  loadAll: () => Promise<ReadonlyArray<EnrollmentType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('enrollment').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db.table('enrollment').whereIn('course_id', courseIds).select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db.table('enrollment').whereIn('account_id', accountIds).select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) return [];

      const rows = await db.table('enrollment').whereIn('program_id', programIds).select();

      return mapToMany(programIds, rows, (r) => r.program_id);
    });

    this.loadAll = async () => {
      const result = await db.table('enrollment').select();

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
      byAccountIdLoader: this.byAccountIdLoader,
      byProgramIdLoader: this.byProgramIdLoader,
    };
  }

  /** Load a single Enrollment by its primary key */
  loadById(id: number): Promise<EnrollmentType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Enrollment records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<EnrollmentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all Enrollment records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<EnrollmentType>> {
    return this.byCourseIdLoader.load(courseId);
  }

  /** Load all Enrollment records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<EnrollmentType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  /** Load all Enrollment records with program_id = `programId` */
  loadByProgramId(programId: number): Promise<ReadonlyArray<EnrollmentType>> {
    return this.byProgramIdLoader.load(programId);
  }
}
