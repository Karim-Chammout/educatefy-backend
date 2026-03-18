// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `YoutubeContent.ts` in this directory
// and extend `YoutubeContentBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { YoutubeContent as YoutubeContentType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class YoutubeContentBase {
  private byIdLoader: DataLoader<number, YoutubeContentType>;

  private byYoutubeVideoIdLoader: DataLoader<string, ReadonlyArray<YoutubeContentType>>;

  private byComponentIdLoader: DataLoader<number, YoutubeContentType>;

  loadAll: () => Promise<ReadonlyArray<YoutubeContentType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('youtube_content').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byYoutubeVideoIdLoader = new DataLoader(async (youtubeVideoIds) => {
      if (youtubeVideoIds.length === 0) return [];

      const rows = await db
        .table('youtube_content')
        .whereIn('youtube_video_id', youtubeVideoIds)
        .select();

      return mapToMany(youtubeVideoIds, rows, (r) => r.youtube_video_id);
    });

    this.byComponentIdLoader = new DataLoader(async (componentIds) => {
      if (componentIds.length === 0) return [];

      const rows = await db.table('youtube_content').whereIn('component_id', componentIds).select();

      return mapTo(componentIds, rows, (r) => r.component_id);
    });

    this.loadAll = async () => {
      const result = await db.table('youtube_content').select();

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
      byYoutubeVideoIdLoader: this.byYoutubeVideoIdLoader,
      byComponentIdLoader: this.byComponentIdLoader,
    };
  }

  /** Load a single YoutubeContent by its primary key */
  loadById(id: number): Promise<YoutubeContentType> {
    return this.byIdLoader.load(id);
  }

  /** Load many YoutubeContent records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<YoutubeContentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all YoutubeContent records with youtube_video_id = `youtubeVideoId` */
  loadByYoutubeVideoId(youtubeVideoId: string): Promise<ReadonlyArray<YoutubeContentType>> {
    return this.byYoutubeVideoIdLoader.load(youtubeVideoId);
  }

  /** Load the YoutubeContent record with component_id = `componentId` */
  loadByComponentId(componentId: number): Promise<YoutubeContentType> {
    return this.byComponentIdLoader.load(componentId);
  }
}
