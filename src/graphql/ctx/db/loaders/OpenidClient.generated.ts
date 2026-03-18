// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `OpenidClient.ts` in this directory
// and extend `OpenidClientBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { OpenidClient as OpenidClientType } from '../../../../types/db-generated-types';
import { mapTo } from './map';

export class OpenidClientBase {
  private byIdLoader: DataLoader<number, OpenidClientType>;

  loadAll: () => Promise<ReadonlyArray<OpenidClientType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('openid_client').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
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
   * Exposes the underlying DataLoader instances so callers can prime or
   * clear the cache directly when needed.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
    };
  }

  /** Load a single OpenidClient by its primary key */
  loadById(id: number): Promise<OpenidClientType> {
    return this.byIdLoader.load(id);
  }

  /** Load many OpenidClient records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<OpenidClientType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }
}
