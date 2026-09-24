import DataLoader from 'dataloader';

import {
  ProgramVersionStatusType,
  Subject as SubjectType,
} from '../../../../types/db-generated-types.js';
import { SubjectBase } from './Subject.generated.js';

export class SubjectReader extends SubjectBase {
  private byCourseIdLoader: DataLoader<number, ReadonlyArray<SubjectType>>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<SubjectType>>;

  // A "singleton-style" loader: every key resolves to the same full result set.
  // We use a dummy numeric key (always pass 1) because DataLoader
  // requires a key, but the query itself ignores it.
  private byLinkedContentLoader: DataLoader<number, ReadonlyArray<SubjectType>>;

  constructor(db: ConstructorParameters<typeof SubjectBase>[0]) {
    super(db);

    this.byCourseIdLoader = new DataLoader(async (courseIds) => {
      if (courseIds.length === 0) {
        return [];
      }

      const rows = await this.db
        .table('subject')
        .join('course__subject', 'subject.id', 'course__subject.subject_id')
        .whereIn('course__subject.course_id', courseIds)
        .select('subject.*', 'course__subject.course_id')
        .then((results) =>
          courseIds.map((courseId) => results.filter((x) => x.course_id === courseId)),
        );

      return rows;
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) {
        return [];
      }

      const rows = await this.db
        .table('subject')
        .join('program__subject', 'subject.id', 'program__subject.subject_id')
        .whereIn('program__subject.program_id', programIds)
        .select('subject.*', 'program__subject.program_id')
        .then((results) =>
          programIds.map((programId) => results.filter((x) => x.program_id === programId)),
        );

      return rows;
    });

    this.byLinkedContentLoader = new DataLoader(async (keys) => {
      // Only subjects with at least one published course or at least one
      // program that has a published version count as "linked content".
      const rows = await this.db
        .table('subject')
        .distinct('subject.*')
        .where((builder) =>
          builder
            .whereExists((qb) =>
              qb
                .from('course__subject')
                .join('course', 'course.id', 'course__subject.course_id')
                .whereRaw('course__subject.subject_id = subject.id')
                .where('course.is_published', true)
                .whereNull('course.deleted_at'),
            )
            .orWhereExists((qb) =>
              qb
                .from('program__subject')
                .join('program', 'program.id', 'program__subject.program_id')
                .join('program_version', 'program_version.program_id', 'program.id')
                .whereRaw('program__subject.subject_id = subject.id')
                .where('program.is_published', true)
                .whereNull('program.deleted_at')
                .where('program_version.status', ProgramVersionStatusType.Published),
            ),
        )
        .select('subject.*');

      // Prime the byIdLoader with the results
      for (const row of rows) {
        this.loaders.byIdLoader.prime(row.id, row);
      }

      return keys.map(() => rows);
    });
  }

  get loaders() {
    return {
      ...super.loaders,
      byCourseIdLoader: this.byCourseIdLoader,
      byProgramIdLoader: this.byProgramIdLoader,
      byLinkedContentLoader: this.byLinkedContentLoader,
    };
  }

  loadByCourseId(courseIds: number): Promise<ReadonlyArray<SubjectType>> {
    return this.byCourseIdLoader.load(courseIds);
  }

  loadByProgramId(programIds: number): Promise<ReadonlyArray<SubjectType>> {
    return this.byProgramIdLoader.load(programIds);
  }

  /** Load all subjects that have at least one associated course or program */
  loadSubjectsWithLinkedContent(): Promise<ReadonlyArray<SubjectType>> {
    // Dummy key — the query ignores the key value entirely
    return this.byLinkedContentLoader.load(1);
  }
}
