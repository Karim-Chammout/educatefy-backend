// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `StudentTeacherFollow.ts` in this directory
// and extend `StudentTeacherFollowBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { StudentTeacherFollow as StudentTeacherFollowType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class StudentTeacherFollowBase {
  private byIdLoader: DataLoader<number, StudentTeacherFollowType>;

  private byStudentIdLoader: DataLoader<number, ReadonlyArray<StudentTeacherFollowType>>;

  private byTeacherIdLoader: DataLoader<number, ReadonlyArray<StudentTeacherFollowType>>;

  loadAll: () => Promise<ReadonlyArray<StudentTeacherFollowType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('student_teacher_follow').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byStudentIdLoader = new DataLoader(async (studentIds) => {
      if (studentIds.length === 0) return [];

      const rows = await db
        .table('student_teacher_follow')
        .whereIn('student_id', studentIds)
        .select();

      return mapToMany(studentIds, rows, (r) => r.student_id);
    });

    this.byTeacherIdLoader = new DataLoader(async (teacherIds) => {
      if (teacherIds.length === 0) return [];

      const rows = await db
        .table('student_teacher_follow')
        .whereIn('teacher_id', teacherIds)
        .select();

      return mapToMany(teacherIds, rows, (r) => r.teacher_id);
    });

    this.loadAll = async () => {
      const result = await db.table('student_teacher_follow').select();

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
      byStudentIdLoader: this.byStudentIdLoader,
      byTeacherIdLoader: this.byTeacherIdLoader,
    };
  }

  /** Load a single StudentTeacherFollow by its primary key */
  loadById(id: number): Promise<StudentTeacherFollowType> {
    return this.byIdLoader.load(id);
  }

  /** Load many StudentTeacherFollow records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<StudentTeacherFollowType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all StudentTeacherFollow records with student_id = `studentId` */
  loadByStudentId(studentId: number): Promise<ReadonlyArray<StudentTeacherFollowType>> {
    return this.byStudentIdLoader.load(studentId);
  }

  /** Load all StudentTeacherFollow records with teacher_id = `teacherId` */
  loadByTeacherId(teacherId: number): Promise<ReadonlyArray<StudentTeacherFollowType>> {
    return this.byTeacherIdLoader.load(teacherId);
  }
}
