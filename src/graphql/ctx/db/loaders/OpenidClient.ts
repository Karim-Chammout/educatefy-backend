import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { OpenidClient as OpenidClientType } from '../../../../types/db-generated-types';

export class OpenidClientReader {
  private byIdLoader: DataLoader<number, OpenidClientType>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<OpenidClientType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('openid_client')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('openid_client').select();

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
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<OpenidClientType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<OpenidClientType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }
}
