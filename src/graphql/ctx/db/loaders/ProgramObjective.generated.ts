// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `ProgramObjective.ts` in this directory
// and extend `ProgramObjectiveBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ProgramObjective as ProgramObjectiveType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class ProgramObjectiveBase {
  private byIdLoader: DataLoader<number, ProgramObjectiveType>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<ProgramObjectiveType>>;

  loadAll: () => Promise<ReadonlyArray<ProgramObjectiveType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('program_objective').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) return [];

      const rows = await db.table('program_objective').whereIn('program_id', programIds).select();

      return mapToMany(programIds, rows, (r) => r.program_id);
    });

    this.loadAll = async () => {
      const result = await db.table('program_objective').select();

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

  /** Load a single ProgramObjective by its primary key */
  loadById(id: number): Promise<ProgramObjectiveType> {
    return this.byIdLoader.load(id);
  }

  /** Load many ProgramObjective records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ProgramObjectiveType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all ProgramObjective records with program_id = `programId` */
  loadByProgramId(programId: number): Promise<ReadonlyArray<ProgramObjectiveType>> {
    return this.byProgramIdLoader.load(programId);
  }
}
