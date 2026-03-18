// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `RefreshToken.ts` in this directory
// and extend `RefreshTokenBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { RefreshToken as RefreshTokenType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class RefreshTokenBase {
  private byIdLoader: DataLoader<number, RefreshTokenType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<RefreshTokenType>>;

  loadAll: () => Promise<ReadonlyArray<RefreshTokenType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('refresh_token').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db.table('refresh_token').whereIn('account_id', accountIds).select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.loadAll = async () => {
      const result = await db.table('refresh_token').select();

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
    };
  }

  /** Load a single RefreshToken by its primary key */
  loadById(id: number): Promise<RefreshTokenType> {
    return this.byIdLoader.load(id);
  }

  /** Load many RefreshToken records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<RefreshTokenType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all RefreshToken records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<RefreshTokenType>> {
    return this.byAccountIdLoader.load(accountId);
  }
}
