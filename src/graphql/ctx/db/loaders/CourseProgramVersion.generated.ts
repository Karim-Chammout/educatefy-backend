// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `CourseProgramVersion.ts` in this directory
// and extend `CourseProgramVersionBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseProgramVersion as CourseProgramVersionType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class CourseProgramVersionBase {
  private byIdLoader: DataLoader<number, CourseProgramVersionType>;

  private byProgramVersionIdLoader: DataLoader<number, ReadonlyArray<CourseProgramVersionType>>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseProgramVersionType>>;

  private byPrerequisiteCourseIdLoader: DataLoader<number, ReadonlyArray<CourseProgramVersionType>>;

  loadAll: () => Promise<ReadonlyArray<CourseProgramVersionType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('course__program_version').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byProgramVersionIdLoader = new DataLoader(async (programVersionIds) => {
      if (programVersionIds.length === 0) return [];

      const rows = await db
        .table('course__program_version')
        .whereIn('program_version_id', programVersionIds)
        .select();

      return mapToMany(programVersionIds, rows, (r) => r.program_version_id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db
        .table('course__program_version')
        .whereIn('course_id', courseIds)
        .select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
    });

    this.byPrerequisiteCourseIdLoader = new DataLoader(async (prerequisiteCourseIds) => {
      if (prerequisiteCourseIds.length === 0) return [];

      const rows = await db
        .table('course__program_version')
        .whereIn('prerequisite_course_id', prerequisiteCourseIds)
        .select();

      return mapToMany(prerequisiteCourseIds, rows, (r) => r.prerequisite_course_id);
    });

    this.loadAll = async () => {
      const result = await db.table('course__program_version').select();

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
      byProgramVersionIdLoader: this.byProgramVersionIdLoader,
      byCourseIdLoader: this.byCourseIdLoader,
      byPrerequisiteCourseIdLoader: this.byPrerequisiteCourseIdLoader,
    };
  }

  /** Load a single CourseProgramVersion by its primary key */
  loadById(id: number): Promise<CourseProgramVersionType> {
    return this.byIdLoader.load(id);
  }

  /** Load many CourseProgramVersion records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseProgramVersionType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all CourseProgramVersion records with program_version_id = `programVersionId` */
  loadByProgramVersionId(
    programVersionId: number,
  ): Promise<ReadonlyArray<CourseProgramVersionType>> {
    return this.byProgramVersionIdLoader.load(programVersionId);
  }

  /** Load all CourseProgramVersion records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<CourseProgramVersionType>> {
    return this.byCourseIdLoader.load(courseId);
  }

  /** Load all CourseProgramVersion records with prerequisite_course_id = `prerequisiteCourseId` */
  loadByPrerequisiteCourseId(
    prerequisiteCourseId: number,
  ): Promise<ReadonlyArray<CourseProgramVersionType>> {
    return this.byPrerequisiteCourseIdLoader.load(prerequisiteCourseId);
  }
}
