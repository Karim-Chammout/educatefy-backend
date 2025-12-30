import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { AccountProgram as AccountProgramType } from '../../../../types/db-generated-types';

export class AccountProgramReader {
  private byIdLoader: DataLoader<number, AccountProgramType>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<AccountProgramType>>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<AccountProgramType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<AccountProgramType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('account__program')
        .whereIn('id', ids)
        .whereNull('deleted_at')
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('account__program')
        .whereIn('program_id', programIds)
        .whereNull('deleted_at')
        .select()
        .then((results) => programIds.map((id) => results.filter((x) => x.program_id === id)));

      return rows;
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('account__program')
        .whereIn('account_id', accountIds)
        .whereNull('deleted_at')
        .select()
        .then((results) => accountIds.map((id) => results.filter((x) => x.account_id === id)));

      return rows;
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
   * This property exposes the private loaders in order to prime or clear the cache of the loader.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byProgramIdLoader: this.byProgramIdLoader,
      byAccountIdLoader: this.byAccountIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<AccountProgramType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AccountProgramType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByProgramId(programId: number): Promise<ReadonlyArray<AccountProgramType>> {
    return this.byProgramIdLoader.load(programId);
  }

  loadByAccountId(accountId: number): Promise<ReadonlyArray<AccountProgramType>> {
    return this.byAccountIdLoader.load(accountId);
  }
}
