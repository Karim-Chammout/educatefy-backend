// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `AccountSubject.ts` in this directory
// and extend `AccountSubjectBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { AccountSubject as AccountSubjectType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class AccountSubjectBase {
  private byIdLoader: DataLoader<number, AccountSubjectType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<AccountSubjectType>>;

  private bySubjectIdLoader: DataLoader<number, ReadonlyArray<AccountSubjectType>>;

  loadAll: () => Promise<ReadonlyArray<AccountSubjectType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('account__subject').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db.table('account__subject').whereIn('account_id', accountIds).select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.bySubjectIdLoader = new DataLoader(async (subjectIds) => {
      if (subjectIds.length === 0) return [];

      const rows = await db.table('account__subject').whereIn('subject_id', subjectIds).select();

      return mapToMany(subjectIds, rows, (r) => r.subject_id);
    });

    this.loadAll = async () => {
      const result = await db.table('account__subject').select();

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
      bySubjectIdLoader: this.bySubjectIdLoader,
    };
  }

  /** Load a single AccountSubject by its primary key */
  loadById(id: number): Promise<AccountSubjectType> {
    return this.byIdLoader.load(id);
  }

  /** Load many AccountSubject records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AccountSubjectType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all AccountSubject records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<AccountSubjectType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  /** Load all AccountSubject records with subject_id = `subjectId` */
  loadBySubjectId(subjectId: number): Promise<ReadonlyArray<AccountSubjectType>> {
    return this.bySubjectIdLoader.load(subjectId);
  }
}
