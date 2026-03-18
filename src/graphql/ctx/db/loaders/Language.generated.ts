// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Language.ts` in this directory
// and extend `LanguageBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Language as LanguageType } from '../../../../types/db-generated-types';
import { mapTo } from './map';

export class LanguageBase {
  private byIdLoader: DataLoader<number, LanguageType>;

  private byCodeLoader: DataLoader<string, LanguageType>;

  loadAll: () => Promise<ReadonlyArray<LanguageType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('language').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCodeLoader = new DataLoader(async (codes) => {
      if (codes.length === 0) return [];

      const rows = await db.table('language').whereIn('code', codes).select();

      return mapTo(codes, rows, (r) => r.code);
    });

    this.loadAll = async () => {
      const result = await db.table('language').select();

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

  /** Load a single Language by its primary key */
  loadById(id: number): Promise<LanguageType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Language records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<LanguageType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load the Language record with code = `code` */
  loadByCode(code: string): Promise<LanguageType> {
    return this.byCodeLoader.load(code);
  }
}
