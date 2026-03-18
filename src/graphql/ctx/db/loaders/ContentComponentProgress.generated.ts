// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `ContentComponentProgress.ts` in this directory
// and extend `ContentComponentProgressBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ContentComponentProgress as ContentComponentProgressType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class ContentComponentProgressBase {
  private byIdLoader: DataLoader<number, ContentComponentProgressType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<ContentComponentProgressType>>;

  private byContentComponentIdLoader: DataLoader<
    number,
    ReadonlyArray<ContentComponentProgressType>
  >;

  private byEnrollmentIdLoader: DataLoader<number, ReadonlyArray<ContentComponentProgressType>>;

  loadAll: () => Promise<ReadonlyArray<ContentComponentProgressType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('content_component_progress').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db
        .table('content_component_progress')
        .whereIn('account_id', accountIds)
        .select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.byContentComponentIdLoader = new DataLoader(async (contentComponentIds) => {
      if (contentComponentIds.length === 0) return [];

      const rows = await db
        .table('content_component_progress')
        .whereIn('content_component_id', contentComponentIds)
        .select();

      return mapToMany(contentComponentIds, rows, (r) => r.content_component_id);
    });

    this.byEnrollmentIdLoader = new DataLoader(async (enrollmentIds) => {
      if (enrollmentIds.length === 0) return [];

      const rows = await db
        .table('content_component_progress')
        .whereIn('enrollment_id', enrollmentIds)
        .select();

      return mapToMany(enrollmentIds, rows, (r) => r.enrollment_id);
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
   * Exposes the underlying DataLoader instances so callers can prime or
   * clear the cache directly when needed.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byAccountIdLoader: this.byAccountIdLoader,
      byContentComponentIdLoader: this.byContentComponentIdLoader,
      byEnrollmentIdLoader: this.byEnrollmentIdLoader,
    };
  }

  /** Load a single ContentComponentProgress by its primary key */
  loadById(id: number): Promise<ContentComponentProgressType> {
    return this.byIdLoader.load(id);
  }

  /** Load many ContentComponentProgress records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ContentComponentProgressType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all ContentComponentProgress records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<ContentComponentProgressType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  /** Load all ContentComponentProgress records with content_component_id = `contentComponentId` */
  loadByContentComponentId(
    contentComponentId: number,
  ): Promise<ReadonlyArray<ContentComponentProgressType>> {
    return this.byContentComponentIdLoader.load(contentComponentId);
  }

  /** Load all ContentComponentProgress records with enrollment_id = `enrollmentId` */
  loadByEnrollmentId(enrollmentId: number): Promise<ReadonlyArray<ContentComponentProgressType>> {
    return this.byEnrollmentIdLoader.load(enrollmentId);
  }
}
