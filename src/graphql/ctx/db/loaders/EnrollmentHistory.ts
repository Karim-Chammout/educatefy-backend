import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { EnrollmentHistory as EnrollmentHistoryType } from '../../../../types/db-generated-types';

export class EnrollmentHistoryReader {
  private byIdLoader: DataLoader<number, EnrollmentHistoryType>;

  private byEnrollmentIdLoader: DataLoader<number, ReadonlyArray<EnrollmentHistoryType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<EnrollmentHistoryType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('enrollment_history')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byEnrollmentIdLoader = new DataLoader(async (enrollmentIds) => {
      if (enrollmentIds.length === 0) {
        return [];
      }
      const rows = await db
        .table('enrollment_history')
        .whereIn('enrollment_id', enrollmentIds)
        .select()
        .then((results) =>
          enrollmentIds.map((enrollmentId) =>
            results.filter((x) => x.enrollment_id === enrollmentId),
          ),
        );

      return rows;
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
   * This property exposes the private loaders in order to prime or clear the cache of the loader.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byEnrollmentIdLoader: this.byEnrollmentIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<EnrollmentHistoryType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<EnrollmentHistoryType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByEnrollmentId(enrollmentIds: number): Promise<ReadonlyArray<EnrollmentHistoryType>> {
    return this.byEnrollmentIdLoader.load(enrollmentIds);
  }
}
