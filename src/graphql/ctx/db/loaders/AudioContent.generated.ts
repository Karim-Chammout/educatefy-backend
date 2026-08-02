// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `AudioContent.ts` in this directory
// and extend `AudioContentBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { AudioContent as AudioContentType } from '../../../../types/db-generated-types.js';
import { mapTo } from './map.js';

export class AudioContentBase {
  private byIdLoader: DataLoader<number, AudioContentType>;

  private byComponentIdLoader: DataLoader<number, AudioContentType>;

  loadAll: () => Promise<ReadonlyArray<AudioContentType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('audio_content').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byComponentIdLoader = new DataLoader(async (componentIds) => {
      if (componentIds.length === 0) return [];

      const rows = await db.table('audio_content').whereIn('component_id', componentIds).select();

      return mapTo(componentIds, rows, (r) => r.component_id);
    });

    this.loadAll = async () => {
      const result = await db.table('audio_content').select();

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

  /** Load a single AudioContent by its primary key */
  loadById(id: number): Promise<AudioContentType> {
    return this.byIdLoader.load(id);
  }

  /** Load many AudioContent records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AudioContentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load the AudioContent record with component_id = `componentId` */
  loadByComponentId(componentId: number): Promise<AudioContentType> {
    return this.byComponentIdLoader.load(componentId);
  }
}
