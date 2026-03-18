import DataLoader from 'dataloader';

import { StudentTeacherFollow as StudentTeacherFollowType } from '../../../../types/db-generated-types';
import { StudentTeacherFollowBase } from './StudentTeacherFollow.generated';

export class StudentTeacherFollowReader extends StudentTeacherFollowBase {
  private byStudentIdAndTeacherIdLoader: DataLoader<
    { studentId: number; teacherId: number },
    StudentTeacherFollowType
  >;

  constructor(db: ConstructorParameters<typeof StudentTeacherFollowBase>[0]) {
    super(db);

    this.byStudentIdAndTeacherIdLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await this.db
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
  }

  get loaders() {
    return {
      ...super.loaders,
      byStudentIdAndTeacherIdLoader: this.byStudentIdAndTeacherIdLoader,
    };
  }

  loadByStudentIdAndTeacherId(
    studentId: number,
    teacherId: number,
  ): Promise<StudentTeacherFollowType> {
    return this.byStudentIdAndTeacherIdLoader.load({ studentId, teacherId });
  }
}
