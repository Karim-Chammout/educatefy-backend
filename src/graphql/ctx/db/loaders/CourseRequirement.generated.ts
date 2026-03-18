// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `CourseRequirement.ts` in this directory
// and extend `CourseRequirementBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseRequirement as CourseRequirementType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class CourseRequirementBase {
  private byIdLoader: DataLoader<number, CourseRequirementType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<CourseRequirementType>>;

  loadAll: () => Promise<ReadonlyArray<CourseRequirementType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('course_requirement').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db.table('course_requirement').whereIn('course_id', courseIds).select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
    });

    this.loadAll = async () => {
      const result = await db.table('course_requirement').select();

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
      byCourseIdLoader: this.byCourseIdLoader,
    };
  }

  /** Load a single CourseRequirement by its primary key */
  loadById(id: number): Promise<CourseRequirementType> {
    return this.byIdLoader.load(id);
  }

  /** Load many CourseRequirement records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseRequirementType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all CourseRequirement records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<CourseRequirementType>> {
    return this.byCourseIdLoader.load(courseId);
  }
}
