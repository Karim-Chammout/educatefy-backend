// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `AccountRole.ts` in this directory
// and extend `AccountRoleBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { AccountRole as AccountRoleType } from '../../../../types/db-generated-types';
import { mapTo } from './map';

export class AccountRoleBase {
  private byIdLoader: DataLoader<number, AccountRoleType>;

  private byCodeLoader: DataLoader<string, AccountRoleType>;

  loadAll: () => Promise<ReadonlyArray<AccountRoleType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('account_role').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCodeLoader = new DataLoader(async (codes) => {
      if (codes.length === 0) return [];

      const rows = await db.table('account_role').whereIn('code', codes).select();

      return mapTo(codes, rows, (r) => r.code);
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
   * Exposes the underlying DataLoader instances so callers can prime or
   * clear the cache directly when needed.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byCodeLoader: this.byCodeLoader,
    };
  }

  /** Load a single AccountRole by its primary key */
  loadById(id: number): Promise<AccountRoleType> {
    return this.byIdLoader.load(id);
  }

  /** Load many AccountRole records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AccountRoleType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load the AccountRole record with code = `code` */
  loadByCode(code: string): Promise<AccountRoleType> {
    return this.byCodeLoader.load(code);
  }
}
