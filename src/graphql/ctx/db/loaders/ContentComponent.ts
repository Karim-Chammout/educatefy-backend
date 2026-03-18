import DataLoader from 'dataloader';

import { ContentComponent as ContentComponentType } from '../../../../types/db-generated-types';
import { ContentComponentBase } from './ContentComponent.generated';

type ParentType = 'lesson' | 'course';

export class ContentComponentReader extends ContentComponentBase {
  private byParentIdAndParentTypeLoader: DataLoader<
    { parentId: number; parentType: ParentType },
    ReadonlyArray<ContentComponentType>
  >;

  constructor(db: ConstructorParameters<typeof ContentComponentBase>[0]) {
    super(db);

    this.byParentIdAndParentTypeLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await this.db
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
  }

  get loaders() {
    return {
      ...super.loaders,
      byParentIdAndParentTypeLoader: this.byParentIdAndParentTypeLoader,
    };
  }

  loadByParentIdAndParentType(
    parentId: number,
    parentType: ParentType,
  ): Promise<ReadonlyArray<ContentComponentType>> {
    return this.byParentIdAndParentTypeLoader.load({ parentId, parentType });
  }
}
