import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Subject as SubjectType } from '../../../../types/db-generated-types';

export class SubjectReader {
  private byIdLoader: DataLoader<number, SubjectType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<SubjectType>>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<SubjectType>>;

  private byLinkedContentLoader: DataLoader<number, ReadonlyArray<SubjectType>>;

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

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('subject')
        .join('course__subject', 'subject.id', 'course__subject.subject_id')
        .whereIn('course__subject.course_id', courseIds)
        .select('subject.*', 'course__subject.course_id')
        .then((results) =>
          courseIds.map((courseId) => results.filter((x) => x.course_id === courseId)),
        );

      return rows;
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('subject')
        .join('program__subject', 'subject.id', 'program__subject.subject_id')
        .whereIn('program__subject.program_id', programIds)
        .select('subject.*', 'program__subject.program_id')
        .then((results) =>
          programIds.map((programId) => results.filter((x) => x.program_id === programId)),
        );

      return rows;
    });

    this.byLinkedContentLoader = new DataLoader(async (keys) => {
      const rows = await db
        .table('subject')
        .distinct('subject.*')
        .leftJoin('course__subject', 'subject.id', 'course__subject.subject_id')
        .leftJoin('program__subject', 'subject.id', 'program__subject.subject_id')
        .where((builder) =>
          builder
            .whereNotNull('course__subject.subject_id')
            .orWhereNotNull('program__subject.subject_id'),
        )
        .select('subject.*');

      // Prime the byIdLoader with the results
      for (const row of rows) {
        this.byIdLoader.prime(row.id, row);
      }

      return keys.map(() => rows);
    });

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
      byCourseIdLoader: this.byCourseIdLoader,
      byProgramIdLoader: this.byProgramIdLoader,
      byLinkedContentLoader: this.byLinkedContentLoader,
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

  loadByCourseId(courseIds: number): Promise<ReadonlyArray<SubjectType>> {
    return this.byCourseIdLoader.load(courseIds);
  }

  loadByProgramId(programIds: number): Promise<ReadonlyArray<SubjectType>> {
    return this.byProgramIdLoader.load(programIds);
  }

  /** Load all subjects that have associated courses */
  loadSubjectsWithLinkedContent(): Promise<ReadonlyArray<SubjectType>> {
    // Use a dummy key (1) since we cannot pass undefined or null
    return this.byLinkedContentLoader.load(1);
  }
}
