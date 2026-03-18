// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Program.ts` in this directory
// and extend `ProgramBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Program as ProgramType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class ProgramBase {
  private byIdLoader: DataLoader<number, ProgramType>;

  private byTeacherIdLoader: DataLoader<number, ReadonlyArray<ProgramType>>;

  private bySlugLoader: DataLoader<string, ProgramType>;

  loadAll: () => Promise<ReadonlyArray<ProgramType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('program').whereIn('id', ids).whereNull('deleted_at').select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byTeacherIdLoader = new DataLoader(async (teacherIds) => {
      if (teacherIds.length === 0) return [];

      const rows = await db
        .table('program')
        .whereIn('teacher_id', teacherIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(teacherIds, rows, (r) => r.teacher_id);
    });

    this.bySlugLoader = new DataLoader(async (slugs) => {
      if (slugs.length === 0) return [];

      const rows = await db
        .table('program')
        .whereIn('slug', slugs)
        .whereNull('deleted_at')
        .select();

      return mapTo(slugs, rows, (r) => r.slug);
    });

    this.loadAll = async () => {
      const result = await db.table('program').whereNull('deleted_at').select();

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
      byTeacherIdLoader: this.byTeacherIdLoader,
      bySlugLoader: this.bySlugLoader,
    };
  }

  /** Load a single Program by its primary key */
  loadById(id: number): Promise<ProgramType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Program records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ProgramType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all Program records with teacher_id = `teacherId` */
  loadByTeacherId(teacherId: number): Promise<ReadonlyArray<ProgramType>> {
    return this.byTeacherIdLoader.load(teacherId);
  }

  /** Load the Program record with slug = `slug` */
  loadBySlug(slug: string): Promise<ProgramType> {
    return this.bySlugLoader.load(slug);
  }
}
