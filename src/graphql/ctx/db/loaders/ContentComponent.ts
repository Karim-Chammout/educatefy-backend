import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ContentComponent as ContentComponentType } from '../../../../types/db-generated-types';

type ParentType = 'lesson' | 'course';

export class ContentComponentReader {
  private byIdLoader: DataLoader<number, ContentComponentType>;

  private byParentIdAndParentTypeLoader: DataLoader<
    { parentId: number; parentType: ParentType },
    ReadonlyArray<ContentComponentType>
  >;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<ContentComponentType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('content_component')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byParentIdAndParentTypeLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await db
          .table('content_component')
          .where((builder) =>
            keys.forEach((key) =>
              builder.orWhere({
                parent_id: key.parentId,
                parent_table: key.parentType,
              }),
            ),
          )
          .select()
          .then((results) =>
            keys.map((key) =>
              results.filter(
                (x) => x.parent_id === key.parentId && x.parent_table === key.parentType,
              ),
            ),
          );

        return rows;
      },
      {
        cacheKeyFn: (key) => `${key.parentId}:${key.parentType}`,
      },
    );

    this.loadAll = async () => {
      const result = await db.table('content_component').select();

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
      byParentIdAndParentTypeLoader: this.byParentIdAndParentTypeLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<ContentComponentType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ContentComponentType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByParentIdAndParentType(
    parentId: number,
    parentType: ParentType,
  ): Promise<ReadonlyArray<ContentComponentType>> {
    return this.byParentIdAndParentTypeLoader.load({ parentId, parentType });
  }
}
