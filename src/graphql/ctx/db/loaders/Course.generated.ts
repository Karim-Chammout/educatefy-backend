// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Course.ts` in this directory
// and extend `CourseBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Course as CourseType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class CourseBase {
  private byIdLoader: DataLoader<number, CourseType>;

  private byLanguageIdLoader: DataLoader<number, ReadonlyArray<CourseType>>;

  private byTeacherIdLoader: DataLoader<number, ReadonlyArray<CourseType>>;

  private bySlugLoader: DataLoader<string, CourseType>;

  loadAll: () => Promise<ReadonlyArray<CourseType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('course').whereIn('id', ids).whereNull('deleted_at').select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byLanguageIdLoader = new DataLoader(async (languageIds) => {
      if (languageIds.length === 0) return [];

      const rows = await db
        .table('course')
        .whereIn('language_id', languageIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(languageIds, rows, (r) => r.language_id);
    });

    this.byTeacherIdLoader = new DataLoader(async (teacherIds) => {
      if (teacherIds.length === 0) return [];

      const rows = await db
        .table('course')
        .whereIn('teacher_id', teacherIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(teacherIds, rows, (r) => r.teacher_id);
    });

    this.bySlugLoader = new DataLoader(async (slugs) => {
      if (slugs.length === 0) return [];

      const rows = await db.table('course').whereIn('slug', slugs).whereNull('deleted_at').select();

      return mapTo(slugs, rows, (r) => r.slug);
    });

    this.loadAll = async () => {
      const result = await db.table('course').whereNull('deleted_at').select();

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
      byLanguageIdLoader: this.byLanguageIdLoader,
      byTeacherIdLoader: this.byTeacherIdLoader,
      bySlugLoader: this.bySlugLoader,
    };
  }

  /** Load a single Course by its primary key */
  loadById(id: number): Promise<CourseType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Course records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all Course records with language_id = `languageId` */
  loadByLanguageId(languageId: number): Promise<ReadonlyArray<CourseType>> {
    return this.byLanguageIdLoader.load(languageId);
  }

  /** Load all Course records with teacher_id = `teacherId` */
  loadByTeacherId(teacherId: number): Promise<ReadonlyArray<CourseType>> {
    return this.byTeacherIdLoader.load(teacherId);
  }

  /** Load the Course record with slug = `slug` */
  loadBySlug(slug: string): Promise<CourseType> {
    return this.bySlugLoader.load(slug);
  }
}
