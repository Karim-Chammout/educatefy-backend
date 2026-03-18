import DataLoader from 'dataloader';

import { File as FileType } from '../../../../types/db-generated-types';
import { FileBase } from './File.generated';

export class FileReader extends FileBase {
  private byAccountIdAndFileTypeLoader: DataLoader<
    { accountId: number; file_type: string },
    ReadonlyArray<FileType>
  >;

  constructor(db: ConstructorParameters<typeof FileBase>[0]) {
    super(db);

    this.byAccountIdAndFileTypeLoader = new DataLoader(
      async (keys) => {
        if (keys.length === 0) {
          return [];
        }

        const rows = await this.db
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
          .then((results) =>
            keys.map((key) =>
              results.filter(
                (x) => x.account_id === key.accountId && x.file_type === key.file_type,
              ),
            ),
          );

        return rows;
      },
      {
        cacheKeyFn: (key) => `${key.accountId}:${key.file_type}`,
      },
    );
  }

  get loaders() {
    return {
      ...super.loaders,
      byAccountIdAndFileTypeLoader: this.byAccountIdAndFileTypeLoader,
    };
  }

  loadByAccountIdAndFileType(
    accountId: number,
    file_type: string,
  ): Promise<ReadonlyArray<FileType>> {
    return this.byAccountIdAndFileTypeLoader.load({ accountId, file_type });
  }
}
