// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `EnrollmentHistory.ts` in this directory
// and extend `EnrollmentHistoryBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { EnrollmentHistory as EnrollmentHistoryType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class EnrollmentHistoryBase {
  private byIdLoader: DataLoader<number, EnrollmentHistoryType>;

  private byEnrollmentIdLoader: DataLoader<number, ReadonlyArray<EnrollmentHistoryType>>;

  loadAll: () => Promise<ReadonlyArray<EnrollmentHistoryType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('enrollment_history').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byEnrollmentIdLoader = new DataLoader(async (enrollmentIds) => {
      if (enrollmentIds.length === 0) return [];

      const rows = await db
        .table('enrollment_history')
        .whereIn('enrollment_id', enrollmentIds)
        .select();

      return mapToMany(enrollmentIds, rows, (r) => r.enrollment_id);
    });

    this.loadAll = async () => {
      const result = await db.table('enrollment_history').select();

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
      byEnrollmentIdLoader: this.byEnrollmentIdLoader,
    };
  }

  /** Load a single EnrollmentHistory by its primary key */
  loadById(id: number): Promise<EnrollmentHistoryType> {
    return this.byIdLoader.load(id);
  }

  /** Load many EnrollmentHistory records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<EnrollmentHistoryType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all EnrollmentHistory records with enrollment_id = `enrollmentId` */
  loadByEnrollmentId(enrollmentId: number): Promise<ReadonlyArray<EnrollmentHistoryType>> {
    return this.byEnrollmentIdLoader.load(enrollmentId);
  }
}
