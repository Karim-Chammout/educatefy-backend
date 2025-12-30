import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseProgram as CourseProgramType } from '../../../../types/db-generated-types';

export class CourseProgramReader {
  private byIdLoader: DataLoader<number, CourseProgramType>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<CourseProgramType>>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseProgramType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<CourseProgramType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('course__program')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('course__program')
        .whereIn('program_id', programIds)
        .select()
        .then((results) => programIds.map((id) => results.filter((x) => x.program_id === id)));

      return rows;
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('course__program')
        .whereIn('course_id', courseIds)
        .select()
        .then((results) => courseIds.map((id) => results.filter((x) => x.course_id === id)));

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('course__program').select();

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
      byProgramIdLoader: this.byProgramIdLoader,
      byCourseIdLoader: this.byCourseIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<CourseProgramType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseProgramType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByProgramId(programId: number): Promise<ReadonlyArray<CourseProgramType>> {
    return this.byProgramIdLoader.load(programId);
  }

  loadByCourseId(courseId: number): Promise<ReadonlyArray<CourseProgramType>> {
    return this.byCourseIdLoader.load(courseId);
  }
}
