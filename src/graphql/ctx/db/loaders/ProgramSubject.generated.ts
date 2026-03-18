// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `ProgramSubject.ts` in this directory
// and extend `ProgramSubjectBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ProgramSubject as ProgramSubjectType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class ProgramSubjectBase {
  private byIdLoader: DataLoader<number, ProgramSubjectType>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<ProgramSubjectType>>;

  private bySubjectIdLoader: DataLoader<number, ReadonlyArray<ProgramSubjectType>>;

  loadAll: () => Promise<ReadonlyArray<ProgramSubjectType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('program__subject').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) return [];

      const rows = await db.table('program__subject').whereIn('program_id', programIds).select();

      return mapToMany(programIds, rows, (r) => r.program_id);
    });

    this.bySubjectIdLoader = new DataLoader(async (subjectIds) => {
      if (subjectIds.length === 0) return [];

      const rows = await db.table('program__subject').whereIn('subject_id', subjectIds).select();

      return mapToMany(subjectIds, rows, (r) => r.subject_id);
    });

    this.loadAll = async () => {
      const result = await db.table('program__subject').select();

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
      byProgramIdLoader: this.byProgramIdLoader,
      bySubjectIdLoader: this.bySubjectIdLoader,
    };
  }

  /** Load a single ProgramSubject by its primary key */
  loadById(id: number): Promise<ProgramSubjectType> {
    return this.byIdLoader.load(id);
  }

  /** Load many ProgramSubject records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ProgramSubjectType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all ProgramSubject records with program_id = `programId` */
  loadByProgramId(programId: number): Promise<ReadonlyArray<ProgramSubjectType>> {
    return this.byProgramIdLoader.load(programId);
  }

  /** Load all ProgramSubject records with subject_id = `subjectId` */
  loadBySubjectId(subjectId: number): Promise<ReadonlyArray<ProgramSubjectType>> {
    return this.bySubjectIdLoader.load(subjectId);
  }
}
