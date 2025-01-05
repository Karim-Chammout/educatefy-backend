import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Enrollment as EnrollmentType } from '../../../../types/db-generated-types';

export class EnrollmentReader {
  private byIdLoader: DataLoader<number, EnrollmentType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<EnrollmentType>>;

  private byAccountIdAndCourseIdLoader: DataLoader<
    { accountId: number; courseId: number },
    EnrollmentType
  >;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<EnrollmentType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('enrollment')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) {
        return [];
      }
      const rows = await db
        .table('enrollment')
        .whereIn('course_id', courseIds)
        .select()
        .then((results) =>
          courseIds.map((courseId) => results.filter((x) => x.course_id === courseId)),
        );

      return rows;
    });

    this.byAccountIdAndCourseIdLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await db
          .table('enrollment')
          .where((builder) =>
            keys.forEach((key) =>
              builder.orWhere({
                account_id: key.accountId,
                course_id: key.courseId,
              }),
            ),
          )
          .select()
          .then((results) =>
            keys.map((key) =>
              results.find((x) => x.account_id === key.accountId && x.course_id === key.courseId),
            ),
          );

        return rows;
      },
      {
        cacheKeyFn: (key) => `${key.accountId}:${key.courseId}`,
      },
    );

    this.loadAll = async () => {
      const result = await db.table('enrollment').select();

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
      byCourseIdLoader: this.byCourseIdLoader,
      byAccountIdAndCourseIdLoader: this.byAccountIdAndCourseIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<EnrollmentType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<EnrollmentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByCourseId(courseIds: number): Promise<ReadonlyArray<EnrollmentType>> {
    return this.byCourseIdLoader.load(courseIds);
  }

  loadByAccountIdAndCourseId(accountId: number, courseId: number): Promise<EnrollmentType> {
    return this.byAccountIdAndCourseIdLoader.load({ accountId, courseId });
  }
}
