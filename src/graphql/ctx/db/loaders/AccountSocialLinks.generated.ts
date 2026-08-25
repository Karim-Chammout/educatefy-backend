// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `AccountSocialLinks.ts` in this directory
// and extend `AccountSocialLinksBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { AccountSocialLinks as AccountSocialLinksType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class AccountSocialLinksBase {
  private byIdLoader: DataLoader<number, AccountSocialLinksType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<AccountSocialLinksType>>;

  loadAll: () => Promise<ReadonlyArray<AccountSocialLinksType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('account_social_links').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db
        .table('account_social_links')
        .whereIn('account_id', accountIds)
        .select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.loadAll = async () => {
      const result = await db.table('account_social_links').select();

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

  /** Load a single AccountSocialLinks by its primary key */
  loadById(id: number): Promise<AccountSocialLinksType> {
    return this.byIdLoader.load(id);
  }

  /** Load many AccountSocialLinks records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AccountSocialLinksType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all AccountSocialLinks records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<AccountSocialLinksType>> {
    return this.byAccountIdLoader.load(accountId);
  }
}
