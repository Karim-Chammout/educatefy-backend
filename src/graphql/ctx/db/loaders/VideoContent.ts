import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { VideoContent as VideoContentType } from '../../../../types/db-generated-types';

export class VideoContentReader {
  private byIdLoader: DataLoader<number, VideoContentType>;

  private byComponentIdLoader: DataLoader<number, VideoContentType>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<VideoContentType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('video_content')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byComponentIdLoader = new DataLoader(async (componentIds) => {
      if (componentIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('video_content')
        .whereIn('component_id', componentIds)
        .select()
        .then((results) =>
          componentIds.map((componentId) => results.find((x) => x.component_id === componentId)),
        );

      return rows;
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
   * This property exposes the private loaders in order to prime or clear the cache of the loader.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byComponentIdLoader: this.byComponentIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<VideoContentType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<VideoContentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByComponentId(componentId: number): Promise<VideoContentType> {
    return this.byComponentIdLoader.load(componentId);
  }
}
