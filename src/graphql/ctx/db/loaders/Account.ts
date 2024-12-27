import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Account as AccountType } from '../../../../types/db-generated-types';

export class AccountReader {
  private byIdLoader: DataLoader<number, AccountType>;

  private byRoleIdLoader: DataLoader<number, ReadonlyArray<AccountType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<AccountType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }

      const rows = await db
        .table('account')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byRoleIdLoader = new DataLoader(async (roleIds) => {
      if (roleIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('account')
        .whereIn('role_id', roleIds)
        .select()
        .then((results) => roleIds.map((id) => results.filter((x) => x.role_id === id)));

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('account').select();

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
      byRoleIdLoader: this.byRoleIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<AccountType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AccountType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByRoleId(roleId: number): Promise<ReadonlyArray<AccountType>> {
    return this.byRoleIdLoader.load(roleId);
  }
}
