import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { YoutubeContent as YoutubeContentType } from '../../../../types/db-generated-types';

export class YoutubeContentReader {
  private byIdLoader: DataLoader<number, YoutubeContentType>;

  private byComponentIdLoader: DataLoader<number, YoutubeContentType>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<YoutubeContentType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('youtube_content')
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
        .table('youtube_content')
        .whereIn('component_id', componentIds)
        .select()
        .then((results) =>
          componentIds.map((componentId) => results.find((x) => x.component_id === componentId)),
        );

      return rows;
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
   * This property exposes the private loaders in order to prime or clear the cache of the loader.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byComponentIdLoader: this.byComponentIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<YoutubeContentType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<YoutubeContentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByComponentId(componentId: number): Promise<YoutubeContentType> {
    return this.byComponentIdLoader.load(componentId);
  }
}
