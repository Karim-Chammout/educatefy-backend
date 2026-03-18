// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Lesson.ts` in this directory
// and extend `LessonBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Lesson as LessonType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class LessonBase {
  private byIdLoader: DataLoader<number, LessonType>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<LessonType>>;

  private byTeacherIdLoader: DataLoader<number, ReadonlyArray<LessonType>>;

  loadAll: () => Promise<ReadonlyArray<LessonType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('lesson').whereIn('id', ids).whereNull('deleted_at').select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) return [];

      const rows = await db
        .table('lesson')
        .whereIn('course_id', courseIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(courseIds, rows, (r) => r.course_id);
    });

    this.byTeacherIdLoader = new DataLoader(async (teacherIds) => {
      if (teacherIds.length === 0) return [];

      const rows = await db
        .table('lesson')
        .whereIn('teacher_id', teacherIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(teacherIds, rows, (r) => r.teacher_id);
    });

    this.loadAll = async () => {
      const result = await db.table('lesson').whereNull('deleted_at').select();

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

  /** Load a single Lesson by its primary key */
  loadById(id: number): Promise<LessonType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Lesson records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<LessonType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all Lesson records with course_id = `courseId` */
  loadByCourseId(courseId: number): Promise<ReadonlyArray<LessonType>> {
    return this.byCourseIdLoader.load(courseId);
  }

  /** Load all Lesson records with teacher_id = `teacherId` */
  loadByTeacherId(teacherId: number): Promise<ReadonlyArray<LessonType>> {
    return this.byTeacherIdLoader.load(teacherId);
  }
}
