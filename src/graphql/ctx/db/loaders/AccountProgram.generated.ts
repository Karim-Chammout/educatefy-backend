// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `AccountProgram.ts` in this directory
// and extend `AccountProgramBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { AccountProgram as AccountProgramType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class AccountProgramBase {
  private byIdLoader: DataLoader<number, AccountProgramType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<AccountProgramType>>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<AccountProgramType>>;

  loadAll: () => Promise<ReadonlyArray<AccountProgramType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db
        .table('account__program')
        .whereIn('id', ids)
        .whereNull('deleted_at')
        .select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db
        .table('account__program')
        .whereIn('account_id', accountIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) return [];

      const rows = await db
        .table('account__program')
        .whereIn('program_id', programIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(programIds, rows, (r) => r.program_id);
    });

    this.loadAll = async () => {
      const result = await db.table('account__program').whereNull('deleted_at').select();

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
      byAccountIdLoader: this.byAccountIdLoader,
      byProgramIdLoader: this.byProgramIdLoader,
    };
  }

  /** Load a single AccountProgram by its primary key */
  loadById(id: number): Promise<AccountProgramType> {
    return this.byIdLoader.load(id);
  }

  /** Load many AccountProgram records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AccountProgramType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all AccountProgram records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<AccountProgramType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  /** Load all AccountProgram records with program_id = `programId` */
  loadByProgramId(programId: number): Promise<ReadonlyArray<AccountProgramType>> {
    return this.byProgramIdLoader.load(programId);
  }
}
