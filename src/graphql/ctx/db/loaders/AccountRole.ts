import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { AccountRole as AccountRoleType } from '../../../../types/db-generated-types';

export class AccountRoleReader {
  private byIdLoader: DataLoader<number, AccountRoleType>;
  private byCodeLoader: DataLoader<string, AccountRoleType>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<AccountRoleType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('account_role')
        .whereIn('id', ids)
        .select()
        .then((rows) => ids.map((id) => rows.find((x) => x.id === id)));

      return rows;
    });

    this.byCodeLoader = new DataLoader(async (codes) => {
      if (codes.length === 0) {
        return [];
      }
      const rows = await db
        .table('account_role')
        .whereIn('code', codes)
        .select()
        .then((rows) => codes.map((code) => rows.find((x) => x.code === code)));

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('account_role').select();

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
      byCodeLoader: this.byCodeLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<AccountRoleType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AccountRoleType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load entity by code */
  loadByCode(code: string): Promise<AccountRoleType> {
    return this.byCodeLoader.load(code);
  }
}
