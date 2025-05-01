import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseRating as CourseRatingType } from '../../../../types/db-generated-types';

export class CourseRatingReader {
  private byIdLoader: DataLoader<number, CourseRatingType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseRatingType>>;

  private byAccountIdAndCourseIdLoader: DataLoader<
    { accountId: number; courseId: number },
    CourseRatingType
  >;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<CourseRatingType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('course_rating')
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
        .table('course_rating')
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
          .table('course_rating')
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
      const result = await db.table('course_rating').select();

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
  loadById(id: number): Promise<CourseRatingType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseRatingType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByCourseId(courseIds: number): Promise<ReadonlyArray<CourseRatingType>> {
    return this.byCourseIdLoader.load(courseIds);
  }

  loadByAccountIdAndCourseId(accountId: number, courseId: number): Promise<CourseRatingType> {
    return this.byAccountIdAndCourseIdLoader.load({ accountId, courseId });
  }
}
