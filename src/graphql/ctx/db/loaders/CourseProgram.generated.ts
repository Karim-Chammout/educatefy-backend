// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `CourseProgram.ts` in this directory
// and extend `CourseProgramBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseProgram as CourseProgramType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class CourseProgramBase {
  private byIdLoader: DataLoader<number, CourseProgramType>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<CourseProgramType>>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseProgramType>>;

  loadAll: () => Promise<ReadonlyArray<CourseProgramType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('course__program').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) return [];

      const rows = await db.table('course__program').whereIn('program_id', programIds).select();

      return mapToMany(programIds, rows, (r) => r.program_id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db.table('course__program').whereIn('course_id', courseIds).select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
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
   * Exposes the underlying DataLoader instances so callers can prime or
   * clear the cache directly when needed.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byProgramIdLoader: this.byProgramIdLoader,
      byCourseIdLoader: this.byCourseIdLoader,
    };
  }

  /** Load a single CourseProgram by its primary key */
  loadById(id: number): Promise<CourseProgramType> {
    return this.byIdLoader.load(id);
  }

  /** Load many CourseProgram records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseProgramType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all CourseProgram records with program_id = `programId` */
  loadByProgramId(programId: number): Promise<ReadonlyArray<CourseProgramType>> {
    return this.byProgramIdLoader.load(programId);
  }

  /** Load all CourseProgram records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<CourseProgramType>> {
    return this.byCourseIdLoader.load(courseId);
  }
}
