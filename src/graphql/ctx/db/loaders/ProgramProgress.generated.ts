// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `ProgramProgress.ts` in this directory
// and extend `ProgramProgressBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ProgramProgress as ProgramProgressType } from '../../../../types/db-generated-types';
import { mapTo } from './map';

export class ProgramProgressBase {
  private byIdLoader: DataLoader<number, ProgramProgressType>;

  private byAccountProgramIdLoader: DataLoader<number, ProgramProgressType>;

  loadAll: () => Promise<ReadonlyArray<ProgramProgressType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('program_progress').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountProgramIdLoader = new DataLoader(async (accountProgramIds) => {
      if (accountProgramIds.length === 0) return [];

      const rows = await db
        .table('program_progress')
        .whereIn('account__program_id', accountProgramIds)
        .select();

      return mapTo(accountProgramIds, rows, (r) => r.account__program_id);
    });

    this.loadAll = async () => {
      const result = await db.table('program_progress').select();

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
      byAccountProgramIdLoader: this.byAccountProgramIdLoader,
    };
  }

  /** Load a single ProgramProgress by its primary key */
  loadById(id: number): Promise<ProgramProgressType> {
    return this.byIdLoader.load(id);
  }

  /** Load many ProgramProgress records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ProgramProgressType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load the ProgramProgress record with account__program_id = `accountProgramId` */
  loadByAccountProgramId(accountProgramId: number): Promise<ProgramProgressType> {
    return this.byAccountProgramIdLoader.load(accountProgramId);
  }
}
