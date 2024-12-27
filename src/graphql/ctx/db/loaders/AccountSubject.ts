import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { AccountSubject as AccountSubjectType } from '../../../../types/db-generated-types';

export class AccountSubjectReader {
  private byIdLoader: DataLoader<number, AccountSubjectType>;
  private byAccountIdLoader: DataLoader<number, ReadonlyArray<AccountSubjectType>>;
  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<AccountSubjectType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('account__subject')
        .whereIn('id', ids)
        .select()
        .then((rows) => ids.map((id) => rows.find((x) => x.id === id)));

      return rows;
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('account__subject')
        .whereIn('account_id', accountIds)
        .select()
        .then((rows) => accountIds.map((id) => rows.filter((x) => x.account_id === id)));

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('account__subject').select();

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
      byAccountIdLoader: this.byAccountIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<AccountSubjectType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AccountSubjectType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByAccountId(accountId: number): Promise<ReadonlyArray<AccountSubjectType>> {
    return this.byAccountIdLoader.load(accountId);
  }
}
