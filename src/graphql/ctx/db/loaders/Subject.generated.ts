// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Subject.ts` in this directory
// and extend `SubjectBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Subject as SubjectType } from '../../../../types/db-generated-types';
import { mapTo } from './map';

export class SubjectBase {
  private byIdLoader: DataLoader<number, SubjectType>;

  loadAll: () => Promise<ReadonlyArray<SubjectType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('subject').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.loadAll = async () => {
      const result = await db.table('subject').select();

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

  /** Load a single Subject by its primary key */
  loadById(id: number): Promise<SubjectType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Subject records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<SubjectType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }
}
