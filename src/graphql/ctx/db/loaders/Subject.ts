import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Subject as SubjectType } from '../../../../types/db-generated-types';

export class SubjectReader {
  private byIdLoader: DataLoader<number, SubjectType>;

  private byLinkedCoursesLoader: DataLoader<number, ReadonlyArray<SubjectType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<SubjectType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('subject')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byLinkedCoursesLoader = new DataLoader(
      async (keys) => {
        const rows = await db
          .table('subject')
          .distinct('subject.*')
          .join('course__subject', 'subject.id', 'course__subject.subject_id')
          .select('subject.*');

        // Prime the byIdLoader with the results
        for (const row of rows) {
          this.byIdLoader.prime(row.id, row);
        }

        return keys.map(() => rows);
      },
      {
        // Since this loader doesn't use keys, we want to cache the result
        cache: true,
      },
    );

    this.loadAll = async () => {
      const result = await db.table('subject').select();

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
      byLinkedCoursesLoader: this.byLinkedCoursesLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<SubjectType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<SubjectType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all subjects that have associated courses */
  loadSubjectsWithLinkedCourses(): Promise<ReadonlyArray<SubjectType>> {
    // Use a dummy key (1) since we cannot pass undefined or null
    return this.byLinkedCoursesLoader.load(1);
  }
}
