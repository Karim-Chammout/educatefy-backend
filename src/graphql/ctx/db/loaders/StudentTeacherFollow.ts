import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { StudentTeacherFollow as StudentTeacherFollowType } from '../../../../types/db-generated-types';

export class StudentTeacherFollowReader {
  private byIdLoader: DataLoader<number, StudentTeacherFollowType>;

  private byStudentIdAndTeacherIdLoader: DataLoader<
    { studentId: number; teacherId: number },
    StudentTeacherFollowType
  >;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<StudentTeacherFollowType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('student_teacher_follow')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byStudentIdAndTeacherIdLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await db
          .table('student_teacher_follow')
          .where((builder) =>
            keys.forEach((key) =>
              builder.orWhere({
                student_id: key.studentId,
                teacher_id: key.teacherId,
              }),
            ),
          )
          .select()
          .then((results) =>
            keys.map((key) =>
              results.find((x) => x.student_id === key.studentId && x.teacher_id === key.teacherId),
            ),
          );

        return rows;
      },
      {
        cacheKeyFn: (key) => `${key.studentId}:${key.teacherId}`,
      },
    );

    this.loadAll = async () => {
      const result = await db.table('student_teacher_follow').select();

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
      byStudentIdAndTeacherIdLoader: this.byStudentIdAndTeacherIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<StudentTeacherFollowType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<StudentTeacherFollowType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByStudentIdAndTeacherId(
    studentId: number,
    teacherId: number,
  ): Promise<StudentTeacherFollowType> {
    return this.byStudentIdAndTeacherIdLoader.load({ studentId, teacherId });
  }
}
