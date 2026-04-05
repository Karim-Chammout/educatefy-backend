// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `ProgramVersion.ts` in this directory
// and extend `ProgramVersionBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ProgramVersion as ProgramVersionType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class ProgramVersionBase {
  private byIdLoader: DataLoader<number, ProgramVersionType>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<ProgramVersionType>>;

  loadAll: () => Promise<ReadonlyArray<ProgramVersionType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('program_version').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) return [];

      const rows = await db.table('program_version').whereIn('program_id', programIds).select();

      return mapToMany(programIds, rows, (r) => r.program_id);
    });

    this.loadAll = async () => {
      const result = await db.table('program_version').select();

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
    };
  }

  /** Load a single ProgramVersion by its primary key */
  loadById(id: number): Promise<ProgramVersionType> {
    return this.byIdLoader.load(id);
  }

  /** Load many ProgramVersion records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ProgramVersionType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all ProgramVersion records with program_id = `programId` */
  loadByProgramId(programId: number): Promise<ReadonlyArray<ProgramVersionType>> {
    return this.byProgramIdLoader.load(programId);
  }
}
