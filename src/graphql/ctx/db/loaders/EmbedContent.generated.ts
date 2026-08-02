// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `EmbedContent.ts` in this directory
// and extend `EmbedContentBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { EmbedContent as EmbedContentType } from '../../../../types/db-generated-types.js';
import { mapTo } from './map.js';

export class EmbedContentBase {
  private byIdLoader: DataLoader<number, EmbedContentType>;

  private byComponentIdLoader: DataLoader<number, EmbedContentType>;

  loadAll: () => Promise<ReadonlyArray<EmbedContentType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('embed_content').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byComponentIdLoader = new DataLoader(async (componentIds) => {
      if (componentIds.length === 0) return [];

      const rows = await db.table('embed_content').whereIn('component_id', componentIds).select();

      return mapTo(componentIds, rows, (r) => r.component_id);
    });

    this.loadAll = async () => {
      const result = await db.table('embed_content').select();

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

  /** Load a single EmbedContent by its primary key */
  loadById(id: number): Promise<EmbedContentType> {
    return this.byIdLoader.load(id);
  }

  /** Load many EmbedContent records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<EmbedContentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load the EmbedContent record with component_id = `componentId` */
  loadByComponentId(componentId: number): Promise<EmbedContentType> {
    return this.byComponentIdLoader.load(componentId);
  }
}
