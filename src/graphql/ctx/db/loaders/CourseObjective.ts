import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseObjective as CourseObjectiveType } from '../../../../types/db-generated-types';

export class CourseObjectiveReader {
  private byIdLoader: DataLoader<number, CourseObjectiveType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseObjectiveType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<CourseObjectiveType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('course_objective')
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
        .table('course_objective')
        .whereIn('course_id', courseIds)
        .select()
        .then((results) =>
          courseIds.map((courseId) => results.filter((x) => x.course_id === courseId)),
        );

      return rows;
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
   * This property exposes the private loaders in order to prime or clear the cache of the loader.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byCourseIdLoader: this.byCourseIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<CourseObjectiveType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseObjectiveType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByCourseId(courseIds: number): Promise<ReadonlyArray<CourseObjectiveType>> {
    return this.byCourseIdLoader.load(courseIds);
  }
}
