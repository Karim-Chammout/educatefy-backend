// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `Account.ts` in this directory
// and extend `AccountBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { Account as AccountType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class AccountBase {
  private byIdLoader: DataLoader<number, AccountType>;

  private byExternalAccountIdLoader: DataLoader<string, ReadonlyArray<AccountType>>;

  private byNationalityIdLoader: DataLoader<number, ReadonlyArray<AccountType>>;

  private byCountryIdLoader: DataLoader<number, ReadonlyArray<AccountType>>;

  private byRoleIdLoader: DataLoader<number, ReadonlyArray<AccountType>>;

  private byPreferredLanguageIdLoader: DataLoader<number, ReadonlyArray<AccountType>>;

  private byEmailLoader: DataLoader<string, AccountType>;

  loadAll: () => Promise<ReadonlyArray<AccountType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('account').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byExternalAccountIdLoader = new DataLoader(async (externalAccountIds) => {
      if (externalAccountIds.length === 0) return [];

      const rows = await db
        .table('account')
        .whereIn('external_account_id', externalAccountIds)
        .select();

      return mapToMany(externalAccountIds, rows, (r) => r.external_account_id);
    });

    this.byNationalityIdLoader = new DataLoader(async (nationalityIds) => {
      if (nationalityIds.length === 0) return [];

      const rows = await db.table('account').whereIn('nationality_id', nationalityIds).select();

      return mapToMany(nationalityIds, rows, (r) => r.nationality_id);
    });

    this.byCountryIdLoader = new DataLoader(async (countryIds) => {
      if (countryIds.length === 0) return [];

      const rows = await db.table('account').whereIn('country_id', countryIds).select();

      return mapToMany(countryIds, rows, (r) => r.country_id);
    });

    this.byRoleIdLoader = new DataLoader(async (roleIds) => {
      if (roleIds.length === 0) return [];

      const rows = await db.table('account').whereIn('role_id', roleIds).select();

      return mapToMany(roleIds, rows, (r) => r.role_id);
    });

    this.byPreferredLanguageIdLoader = new DataLoader(async (preferredLanguageIds) => {
      if (preferredLanguageIds.length === 0) return [];

      const rows = await db
        .table('account')
        .whereIn('preferred_language_id', preferredLanguageIds)
        .select();

      return mapToMany(preferredLanguageIds, rows, (r) => r.preferred_language_id);
    });

    this.byEmailLoader = new DataLoader(async (emails) => {
      if (emails.length === 0) return [];

      const rows = await db.table('account').whereIn('email', emails).select();

      return mapTo(emails, rows, (r) => r.email);
    });

    this.loadAll = async () => {
      const result = await db.table('account').select();

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
      byExternalAccountIdLoader: this.byExternalAccountIdLoader,
      byNationalityIdLoader: this.byNationalityIdLoader,
      byCountryIdLoader: this.byCountryIdLoader,
      byRoleIdLoader: this.byRoleIdLoader,
      byPreferredLanguageIdLoader: this.byPreferredLanguageIdLoader,
      byEmailLoader: this.byEmailLoader,
    };
  }

  /** Load a single Account by its primary key */
  loadById(id: number): Promise<AccountType> {
    return this.byIdLoader.load(id);
  }

  /** Load many Account records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<AccountType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all Account records with external_account_id = `externalAccountId` */
  loadByExternalAccountId(externalAccountId: string): Promise<ReadonlyArray<AccountType>> {
    return this.byExternalAccountIdLoader.load(externalAccountId);
  }

  /** Load all Account records with nationality_id = `nationalityId` */
  loadByNationalityId(nationalityId: number): Promise<ReadonlyArray<AccountType>> {
    return this.byNationalityIdLoader.load(nationalityId);
  }

  /** Load all Account records with country_id = `countryId` */
  loadByCountryId(countryId: number): Promise<ReadonlyArray<AccountType>> {
    return this.byCountryIdLoader.load(countryId);
  }

  /** Load all Account records with role_id = `roleId` */
  loadByRoleId(roleId: number): Promise<ReadonlyArray<AccountType>> {
    return this.byRoleIdLoader.load(roleId);
  }

  /** Load all Account records with preferred_language_id = `preferredLanguageId` */
  loadByPreferredLanguageId(preferredLanguageId: number): Promise<ReadonlyArray<AccountType>> {
    return this.byPreferredLanguageIdLoader.load(preferredLanguageId);
  }

  /** Load the Account record with email = `email` */
  loadByEmail(email: string): Promise<AccountType> {
    return this.byEmailLoader.load(email);
  }
}
