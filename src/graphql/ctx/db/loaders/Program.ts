import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Program as ProgramType } from '../../../../types/db-generated-types';

export class ProgramReader {
  private byIdLoader: DataLoader<number, ProgramType>;

  private bySlugLoader: DataLoader<string, ProgramType>;

  private byTeacherIdLoader: DataLoader<number, ReadonlyArray<ProgramType>>;

  private bySubjectIdLoader: DataLoader<number, ReadonlyArray<ProgramType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<ProgramType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('program')
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
        .table('program')
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
        .table('program')
        .whereIn('teacher_id', teacherIds)
        .whereNull('deleted_at')
        .select()
        .then((results) =>
          teacherIds.map((teacherId) => results.filter((x) => x.teacher_id === teacherId)),
        );

      return rows;
    });

    this.bySubjectIdLoader = new DataLoader(async (subjectIds) => {
      if (subjectIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('program')
        .join('program__subject', 'program.id', 'program__subject.program_id')
        .whereIn('program__subject.subject_id', subjectIds)
        .whereNull('program.deleted_at')
        .select('program.*', 'program__subject.subject_id')
        .then((results) =>
          subjectIds.map((subjectId) => results.filter((x) => x.subject_id === subjectId)),
        );

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('program').select();

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
      bySubjectIdLoader: this.bySubjectIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<ProgramType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ProgramType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadBySlug(slug: string): Promise<ProgramType> {
    return this.bySlugLoader.load(slug);
  }

  loadByTeacherId(teacherId: number): Promise<ReadonlyArray<ProgramType>> {
    return this.byTeacherIdLoader.load(teacherId);
  }

  loadBySubjectId(subjectId: number): Promise<ReadonlyArray<ProgramType>> {
    return this.bySubjectIdLoader.load(subjectId);
  }
}
