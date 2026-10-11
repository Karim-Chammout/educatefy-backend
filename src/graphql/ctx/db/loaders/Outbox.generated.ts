// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Outbox.ts` in this directory
// and extend `OutboxBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { Outbox as OutboxType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class OutboxBase {
  private byIdLoader: DataLoader<number, OutboxType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<OutboxType>>;

  private byTypeIdLoader: DataLoader<number, ReadonlyArray<OutboxType>>;

  private byProviderMessageIdLoader: DataLoader<string, ReadonlyArray<OutboxType>>;

  loadAll: () => Promise<ReadonlyArray<OutboxType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('outbox').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db.table('outbox').whereIn('account_id', accountIds).select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.byTypeIdLoader = new DataLoader(async (typeIds) => {
      if (typeIds.length === 0) return [];

      const rows = await db.table('outbox').whereIn('type_id', typeIds).select();

      return mapToMany(typeIds, rows, (r) => r.type_id);
    });

    this.byProviderMessageIdLoader = new DataLoader(async (providerMessageIds) => {
      if (providerMessageIds.length === 0) return [];

      const rows = await db
        .table('outbox')
        .whereIn('provider_message_id', providerMessageIds)
        .select();

      return mapToMany(providerMessageIds, rows, (r) => r.provider_message_id);
    });

    this.loadAll = async () => {
      const result = await db.table('outbox').select();

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
      byProviderMessageIdLoader: this.byProviderMessageIdLoader,
    };
  }

  /** Load a single Outbox by its primary key */
  loadById(id: number): Promise<OutboxType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Outbox records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<OutboxType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all Outbox records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<OutboxType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  /** Load all Outbox records with type_id = `typeId` */
  loadByTypeId(typeId: number): Promise<ReadonlyArray<OutboxType>> {
    return this.byTypeIdLoader.load(typeId);
  }

  /** Load all Outbox records with provider_message_id = `providerMessageId` */
  loadByProviderMessageId(providerMessageId: string): Promise<ReadonlyArray<OutboxType>> {
    return this.byProviderMessageIdLoader.load(providerMessageId);
  }
}
