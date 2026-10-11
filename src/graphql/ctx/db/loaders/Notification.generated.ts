// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Notification.ts` in this directory
// and extend `NotificationBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { Notification as NotificationType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class NotificationBase {
  private byIdLoader: DataLoader<number, NotificationType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<NotificationType>>;

  private byTypeIdLoader: DataLoader<number, ReadonlyArray<NotificationType>>;

  private byActorIdLoader: DataLoader<number, ReadonlyArray<NotificationType>>;

  loadAll: () => Promise<ReadonlyArray<NotificationType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db
        .table('notification')
        .whereIn('id', ids)
        .whereNull('deleted_at')
        .select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db
        .table('notification')
        .whereIn('account_id', accountIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.byTypeIdLoader = new DataLoader(async (typeIds) => {
      if (typeIds.length === 0) return [];

      const rows = await db
        .table('notification')
        .whereIn('type_id', typeIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(typeIds, rows, (r) => r.type_id);
    });

    this.byActorIdLoader = new DataLoader(async (actorIds) => {
      if (actorIds.length === 0) return [];

      const rows = await db
        .table('notification')
        .whereIn('actor_id', actorIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(actorIds, rows, (r) => r.actor_id);
    });

    this.loadAll = async () => {
      const result = await db.table('notification').whereNull('deleted_at').select();

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
      byActorIdLoader: this.byActorIdLoader,
    };
  }

  /** Load a single Notification by its primary key */
  loadById(id: number): Promise<NotificationType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Notification records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<NotificationType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all Notification records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<NotificationType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  /** Load all Notification records with type_id = `typeId` */
  loadByTypeId(typeId: number): Promise<ReadonlyArray<NotificationType>> {
    return this.byTypeIdLoader.load(typeId);
  }

  /** Load all Notification records with actor_id = `actorId` */
  loadByActorId(actorId: number): Promise<ReadonlyArray<NotificationType>> {
    return this.byActorIdLoader.load(actorId);
  }
}
