import DataLoader from 'dataloader';

import { Course as CourseType } from '../../../../types/db-generated-types';
import { CourseBase } from './Course.generated';

export class CourseReader extends CourseBase {
  private bySubjectIdLoader: DataLoader<number, ReadonlyArray<CourseType>>;

  constructor(db: ConstructorParameters<typeof CourseBase>[0]) {
    super(db);

    this.bySubjectIdLoader = new DataLoader(async (subjectIds) => {
      if (subjectIds.length === 0) {
        return [];
      }

      const rows = await this.db
        .table('course')
        .join('course__subject', 'course.id', 'course__subject.course_id')
        .whereIn('course__subject.subject_id', subjectIds)
        .whereNull('course.deleted_at')
        .select('course.*', 'course__subject.subject_id')
        .then((results) =>
          subjectIds.map((subjectId) => results.filter((x) => x.subject_id === subjectId)),
        );

      return rows;
    });
  }

  get loaders() {
    return {
      ...super.loaders,
      bySubjectIdLoader: this.bySubjectIdLoader,
    };
  }

  loadBySubjectId(subjectId: number): Promise<ReadonlyArray<CourseType>> {
    return this.bySubjectIdLoader.load(subjectId);
  }
}
