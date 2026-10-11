// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `NotificationPreference.ts` in this directory
// and extend `NotificationPreferenceBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { NotificationPreference as NotificationPreferenceType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class NotificationPreferenceBase {
  private byIdLoader: DataLoader<number, NotificationPreferenceType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<NotificationPreferenceType>>;

  private byTypeIdLoader: DataLoader<number, ReadonlyArray<NotificationPreferenceType>>;

  loadAll: () => Promise<ReadonlyArray<NotificationPreferenceType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('notification_preference').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db
        .table('notification_preference')
        .whereIn('account_id', accountIds)
        .select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.byTypeIdLoader = new DataLoader(async (typeIds) => {
      if (typeIds.length === 0) return [];

      const rows = await db.table('notification_preference').whereIn('type_id', typeIds).select();

      return mapToMany(typeIds, rows, (r) => r.type_id);
    });

    this.loadAll = async () => {
      const result = await db.table('notification_preference').select();

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
      byTypeIdLoader: this.byTypeIdLoader,
    };
  }

  /** Load a single NotificationPreference by its primary key */
  loadById(id: number): Promise<NotificationPreferenceType> {
    return this.byIdLoader.load(id);
  }

  /** Load many NotificationPreference records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<NotificationPreferenceType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all NotificationPreference records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<NotificationPreferenceType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  /** Load all NotificationPreference records with type_id = `typeId` */
  loadByTypeId(typeId: number): Promise<ReadonlyArray<NotificationPreferenceType>> {
    return this.byTypeIdLoader.load(typeId);
  }
}
