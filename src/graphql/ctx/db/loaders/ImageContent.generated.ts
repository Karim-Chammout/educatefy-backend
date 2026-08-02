// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `ImageContent.ts` in this directory
// and extend `ImageContentBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { ImageContent as ImageContentType } from '../../../../types/db-generated-types.js';
import { mapTo } from './map.js';

export class ImageContentBase {
  private byIdLoader: DataLoader<number, ImageContentType>;

  private byComponentIdLoader: DataLoader<number, ImageContentType>;

  loadAll: () => Promise<ReadonlyArray<ImageContentType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('image_content').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byComponentIdLoader = new DataLoader(async (componentIds) => {
      if (componentIds.length === 0) return [];

      const rows = await db.table('image_content').whereIn('component_id', componentIds).select();

      return mapTo(componentIds, rows, (r) => r.component_id);
    });

    this.loadAll = async () => {
      const result = await db.table('image_content').select();

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
      byComponentIdLoader: this.byComponentIdLoader,
    };
  }

  /** Load a single ImageContent by its primary key */
  loadById(id: number): Promise<ImageContentType> {
    return this.byIdLoader.load(id);
  }

  /** Load many ImageContent records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ImageContentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load the ImageContent record with component_id = `componentId` */
  loadByComponentId(componentId: number): Promise<ImageContentType> {
    return this.byComponentIdLoader.load(componentId);
  }
}
