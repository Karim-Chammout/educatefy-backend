import DataLoader from 'dataloader';

import { Program as ProgramType } from '../../../../types/db-generated-types';
import { ProgramBase } from './Program.generated';

export class ProgramReader extends ProgramBase {
  private bySubjectIdLoader: DataLoader<number, ReadonlyArray<ProgramType>>;

  constructor(db: ConstructorParameters<typeof ProgramBase>[0]) {
    super(db);

    this.bySubjectIdLoader = new DataLoader(async (subjectIds) => {
      if (subjectIds.length === 0) {
        return [];
      }

      const rows = await this.db
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
  }

  get loaders() {
    return {
      ...super.loaders,
      bySubjectIdLoader: this.bySubjectIdLoader,
    };
  }

  loadBySubjectId(subjectId: number): Promise<ReadonlyArray<ProgramType>> {
    return this.bySubjectIdLoader.load(subjectId);
  }
}
