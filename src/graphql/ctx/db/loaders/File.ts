import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { File as FileType } from '../../../../types/db-generated-types';

export class FileReader {
  private byIdLoader: DataLoader<number, FileType>;
  private byAccountIdLoader: DataLoader<number, ReadonlyArray<FileType>>;
  private byAccountIdAndFileTypeLoader: DataLoader<
    { accountId: number; file_type: string },
    ReadonlyArray<FileType>
  >;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<FileType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }

      const rows = await db
        .table('file')
        .whereIn('id', ids)
        .select()
        .then((rows) => ids.map((id) => rows.find((x) => x.id === id)));

      return rows;
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('file')
        .whereIn('account_id', accountIds)
        .select()
        .then((rows) => accountIds.map((id) => rows.filter((x) => x.account_id === id)));

      return rows;
    });

    this.byAccountIdAndFileTypeLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await db
          .table('file')
          .where((builder) =>
            keys.forEach((key) =>
              builder.orWhere({
                account_id: key.accountId,
                file_type: key.file_type,
              }),
            ),
          )
          .select()
          .then((rows) =>
            keys.map((key) =>
              rows.filter((x) => x.account_id === key.accountId && x.file_type === key.file_type),
            ),
          );

        return rows;
      },
      {
        cacheKeyFn: (key) => `${key.accountId}:${key.file_type}`,
      },
    );

    this.loadAll = async () => {
      const result = await db.table('file').select();

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
      byAccountIdLoader: this.byAccountIdLoader,
      byAccountIdAndFileTypeLoader: this.byAccountIdAndFileTypeLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<FileType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<FileType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByAccountId(roleId: number): Promise<ReadonlyArray<FileType>> {
    return this.byAccountIdLoader.load(roleId);
  }

  loadByAccountIdAndFileType(
    accountId: number,
    file_type: string,
  ): Promise<ReadonlyArray<FileType>> {
    return this.byAccountIdAndFileTypeLoader.load({ accountId, file_type });
  }
}
