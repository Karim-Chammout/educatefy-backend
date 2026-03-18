import DataLoader from 'dataloader';

import { ContentComponentProgress as ContentComponentProgressType } from '../../../../types/db-generated-types';
import { ContentComponentProgressBase } from './ContentComponentProgress.generated';

export class ContentComponentProgressReader extends ContentComponentProgressBase {
  private byAccountIdAndComponentIdLoader: DataLoader<
    { accountId: number; componentId: number },
    ContentComponentProgressType
  >;

  constructor(db: ConstructorParameters<typeof ContentComponentProgressBase>[0]) {
    super(db);

    this.byAccountIdAndComponentIdLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await this.db
          .table('content_component_progress')
          .where((builder) =>
            keys.forEach((key) =>
              builder.orWhere({
                account_id: key.accountId,
                content_component_id: key.componentId,
              }),
            ),
          )
          .select()
          .then((results) =>
            keys.map((key) =>
              results.find(
                (x) => x.account_id === key.accountId && x.content_component_id === key.componentId,
              ),
            ),
          );

        return rows;
      },
      {
        cacheKeyFn: (key) => `${key.accountId}:${key.componentId}`,
      },
    );
  }

  get loaders() {
    return {
      ...super.loaders,
      byAccountIdAndComponentIdLoader: this.byAccountIdAndComponentIdLoader,
    };
  }

  loadByAccountIdAndComponentId(
    accountId: number,
    componentId: number,
  ): Promise<ContentComponentProgressType> {
    return this.byAccountIdAndComponentIdLoader.load({ accountId, componentId });
  }
}
