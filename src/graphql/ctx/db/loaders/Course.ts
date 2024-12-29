import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Course as CourseType } from '../../../../types/db-generated-types';

export class CourseReader {
  private byIdLoader: DataLoader<number, CourseType>;

  private bySlugLoader: DataLoader<string, CourseType>;

  private byTeacherIdLoader: DataLoader<number, ReadonlyArray<CourseType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<CourseType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('course')
        .whereIn('id', ids)
        .whereNull('deleted_at')
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.bySlugLoader = new DataLoader(async (slugs) => {
      if (slugs.length === 0) {
        return [];
      }
      const rows = await db
        .table('course')
        .whereIn('slug', slugs)
        .whereNull('deleted_at')
        .select()
        .then((results) => slugs.map((slug) => results.find((x) => x.slug === slug)));

      return rows;
    });

    this.byTeacherIdLoader = new DataLoader(async (teacherIds) => {
      if (teacherIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('course')
        .whereIn('teacher_id', teacherIds)
        .whereNull('deleted_at')
        .select()
        .then((results) =>
          teacherIds.map((teacherId) => results.filter((x) => x.teacher_id === teacherId)),
        );

      return rows;
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
   * This property exposes the private loaders in order to prime or clear the cache of the loader.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      bySlugLoader: this.bySlugLoader,
      byTeacherIdLoader: this.byTeacherIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<CourseType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadBySlug(slug: string): Promise<CourseType> {
    return this.bySlugLoader.load(slug);
  }

  loadByTeacherId(teacherId: number): Promise<ReadonlyArray<CourseType>> {
    return this.byTeacherIdLoader.load(teacherId);
  }
}
