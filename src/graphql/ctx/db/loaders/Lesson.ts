import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Lesson as LessonType } from '../../../../types/db-generated-types';

export class LessonReader {
  private byIdLoader: DataLoader<number, LessonType>;

  private byTeacherIdLoader: DataLoader<number, ReadonlyArray<LessonType>>;

  private byCourseIdLoader: DataLoader<number, ReadonlyArray<LessonType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<LessonType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('lesson')
        .whereIn('id', ids)
        .whereNull('deleted_at')
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byTeacherIdLoader = new DataLoader(async (teacherIds) => {
      if (teacherIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('lesson')
        .whereIn('teacher_id', teacherIds)
        .whereNull('deleted_at')
        .select()
        .then((results) =>
          teacherIds.map((teacherId) => results.filter((x) => x.teacher_id === teacherId)),
        );

      return rows;
    });

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) {
        return [];
      }
      const rows = await db
        .table('lesson')
        .whereIn('course_id', courseIds)
        .whereNull('deleted_at')
        .select()
        .then((results) =>
          courseIds.map((courseId) => results.filter((x) => x.course_id === courseId)),
        );

      return rows;
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
   * This property exposes the private loaders in order to prime or clear the cache of the loader.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byTeacherIdLoader: this.byTeacherIdLoader,
      byCourseIdLoader: this.byCourseIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<LessonType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<LessonType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByTeacherId(teacherId: number): Promise<ReadonlyArray<LessonType>> {
    return this.byTeacherIdLoader.load(teacherId);
  }

  loadByCourseId(courseIds: number): Promise<ReadonlyArray<LessonType>> {
    return this.byCourseIdLoader.load(courseIds);
  }
}
