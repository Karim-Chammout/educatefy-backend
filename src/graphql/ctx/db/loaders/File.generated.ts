// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `File.ts` in this directory
// and extend `FileBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { File as FileType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class FileBase {
  private byIdLoader: DataLoader<number, FileType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<FileType>>;

  loadAll: () => Promise<ReadonlyArray<FileType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('file').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db.table('file').whereIn('account_id', accountIds).select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.loadAll = async () => {
      const result = await db.table('file').select();

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

  /** Load a single File by its primary key */
  loadById(id: number): Promise<FileType> {
    return this.byIdLoader.load(id);
  }

  /** Load many File records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<FileType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all File records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<FileType>> {
    return this.byAccountIdLoader.load(accountId);
  }
}
