// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `VideoContent.ts` in this directory
// and extend `VideoContentBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { VideoContent as VideoContentType } from '../../../../types/db-generated-types';
import { mapTo } from './map';

export class VideoContentBase {
  private byIdLoader: DataLoader<number, VideoContentType>;

  private byComponentIdLoader: DataLoader<number, VideoContentType>;

  loadAll: () => Promise<ReadonlyArray<VideoContentType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('video_content').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byComponentIdLoader = new DataLoader(async (componentIds) => {
      if (componentIds.length === 0) return [];

      const rows = await db.table('video_content').whereIn('component_id', componentIds).select();

      return mapTo(componentIds, rows, (r) => r.component_id);
    });

    this.loadAll = async () => {
      const result = await db.table('video_content').select();

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

  /** Load a single VideoContent by its primary key */
  loadById(id: number): Promise<VideoContentType> {
    return this.byIdLoader.load(id);
  }

  /** Load many VideoContent records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<VideoContentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load the VideoContent record with component_id = `componentId` */
  loadByComponentId(componentId: number): Promise<VideoContentType> {
    return this.byComponentIdLoader.load(componentId);
  }
}
