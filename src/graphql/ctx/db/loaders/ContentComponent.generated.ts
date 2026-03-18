// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `ContentComponent.ts` in this directory
// and extend `ContentComponentBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ContentComponent as ContentComponentType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class ContentComponentBase {
  private byIdLoader: DataLoader<number, ContentComponentType>;

  private byParentIdLoader: DataLoader<number, ReadonlyArray<ContentComponentType>>;

  loadAll: () => Promise<ReadonlyArray<ContentComponentType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('content_component').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byParentIdLoader = new DataLoader(async (parentIds) => {
      if (parentIds.length === 0) return [];

      const rows = await db.table('content_component').whereIn('parent_id', parentIds).select();

      return mapToMany(parentIds, rows, (r) => r.parent_id);
    });

    this.loadAll = async () => {
      const result = await db.table('content_component').select();

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
      byParentIdLoader: this.byParentIdLoader,
    };
  }

  /** Load a single ContentComponent by its primary key */
  loadById(id: number): Promise<ContentComponentType> {
    return this.byIdLoader.load(id);
  }

  /** Load many ContentComponent records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ContentComponentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all ContentComponent records with parent_id = `parentId` */
  loadByParentId(parentId: number): Promise<ReadonlyArray<ContentComponentType>> {
    return this.byParentIdLoader.load(parentId);
  }
}
