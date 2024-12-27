import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Country as CountryType } from '../../../../types/db-generated-types';

export class CountryReader {
  private byIdLoader: DataLoader<number, CountryType>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<CountryType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('country')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('country').select();

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
  loadById(id: number): Promise<CountryType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CountryType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }
}
