import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ContentComponentProgress as ContentComponentProgressType } from '../../../../types/db-generated-types';

export class ContentComponentProgressReader {
  private byIdLoader: DataLoader<number, ContentComponentProgressType>;

  private byAccountIdAndComponentIdLoader: DataLoader<
    { accountId: number; componentId: number },
    ContentComponentProgressType
  >;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<ContentComponentProgressType>>;

  private byEnrollmentIdLoader: DataLoader<number, ReadonlyArray<ContentComponentProgressType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<ContentComponentProgressType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('content_component_progress')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byAccountIdAndComponentIdLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await db
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

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) {
        return [];
      }
      const rows = await db
        .table('content_component_progress')
        .whereIn('account_id', accountIds)
        .select()
        .then((results) =>
          accountIds.map((accountId) => results.filter((x) => x.account_id === accountId)),
        );

      return rows;
    });

    this.byEnrollmentIdLoader = new DataLoader(async (enrollmentIds) => {
      if (enrollmentIds.length === 0) {
        return [];
      }
      const rows = await db
        .table('content_component_progress')
        .whereIn('enrollment_id', enrollmentIds)
        .select()
        .then((results) =>
          enrollmentIds.map((enrollmentId) =>
            results.filter((x) => x.enrollment_id === enrollmentId),
          ),
        );

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('content_component_progress').select();

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
      byAccountIdAndComponentIdLoader: this.byAccountIdAndComponentIdLoader,
      byAccountIdLoader: this.byAccountIdLoader,
      byEnrollmentIdLoader: this.byEnrollmentIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<ContentComponentProgressType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ContentComponentProgressType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByAccountIdAndComponentId(
    accountId: number,
    componentId: number,
  ): Promise<ContentComponentProgressType> {
    return this.byAccountIdAndComponentIdLoader.load({ accountId, componentId });
  }

  loadByAccountId(accountId: number): Promise<ReadonlyArray<ContentComponentProgressType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  loadByEnrollmentId(enrollmentId: number): Promise<ReadonlyArray<ContentComponentProgressType>> {
    return this.byEnrollmentIdLoader.load(enrollmentId);
  }
}
