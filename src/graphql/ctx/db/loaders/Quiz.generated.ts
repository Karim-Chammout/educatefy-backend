// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Quiz.ts` in this directory
// and extend `QuizBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { Quiz as QuizType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class QuizBase {
  private byIdLoader: DataLoader<number, QuizType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<QuizType>>;

  private byTeacherIdLoader: DataLoader<number, ReadonlyArray<QuizType>>;

  loadAll: () => Promise<ReadonlyArray<QuizType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('quiz').whereIn('id', ids).whereNull('deleted_at').select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db
        .table('quiz')
        .whereIn('course_id', courseIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
    });

    this.byTeacherIdLoader = new DataLoader(async (teacherIds) => {
      if (teacherIds.length === 0) return [];

      const rows = await db
        .table('quiz')
        .whereIn('teacher_id', teacherIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(teacherIds, rows, (r) => r.teacher_id);
    });

    this.loadAll = async () => {
      const result = await db.table('quiz').whereNull('deleted_at').select();

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
      byTeacherIdLoader: this.byTeacherIdLoader,
    };
  }

  /** Load a single Quiz by its primary key */
  loadById(id: number): Promise<QuizType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Quiz records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<QuizType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all Quiz records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<QuizType>> {
    return this.byCourseIdLoader.load(courseId);
  }

  /** Load all Quiz records with teacher_id = `teacherId` */
  loadByTeacherId(teacherId: number): Promise<ReadonlyArray<QuizType>> {
    return this.byTeacherIdLoader.load(teacherId);
  }
}
