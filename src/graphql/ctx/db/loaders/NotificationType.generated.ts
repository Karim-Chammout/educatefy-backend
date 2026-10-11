// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `NotificationType.ts` in this directory
// and extend `NotificationTypeBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { NotificationType as NotificationTypeType } from '../../../../types/db-generated-types.js';
import { mapTo } from './map.js';

export class NotificationTypeBase {
  private byIdLoader: DataLoader<number, NotificationTypeType>;

  private byCodeLoader: DataLoader<string, NotificationTypeType>;

  loadAll: () => Promise<ReadonlyArray<NotificationTypeType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('notification_type').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCodeLoader = new DataLoader(async (codes) => {
      if (codes.length === 0) return [];

      const rows = await db.table('notification_type').whereIn('code', codes).select();

      return mapTo(codes, rows, (r) => r.code);
    });

    this.loadAll = async () => {
      const result = await db.table('notification_type').select();

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
      byCodeLoader: this.byCodeLoader,
    };
  }

  /** Load a single NotificationType by its primary key */
  loadById(id: number): Promise<NotificationTypeType> {
    return this.byIdLoader.load(id);
  }

  /** Load many NotificationType records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<NotificationTypeType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load the NotificationType record with code = `code` */
  loadByCode(code: string): Promise<NotificationTypeType> {
    return this.byCodeLoader.load(code);
  }
}
