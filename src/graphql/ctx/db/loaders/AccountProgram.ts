import DataLoader from 'dataloader';

import { AccountProgram as AccountProgramType } from '../../../../types/db-generated-types';
import { AccountProgramBase } from './AccountProgram.generated';

export class AccountProgramReader extends AccountProgramBase {
  private byAccountIdAndProgramIdLoader: DataLoader<
    { accountId: number; programId: number },
    AccountProgramType
  >;

  constructor(db: ConstructorParameters<typeof AccountProgramBase>[0]) {
    super(db);

    this.byAccountIdAndProgramIdLoader = new DataLoader(async (keys) => {
      if (keys.length === 0) {
        return [];
      }

      const rows = await this.db
        .table('account__program')
        .whereNull('deleted_at')
        .where((builder) =>
          keys.forEach((key) =>
            builder.orWhere({
              account_id: key.accountId,
              program_id: key.programId,
            }),
          ),
        )
        .select()
        .then((results) =>
          keys.map((key) =>
            results.find((x) => x.account_id === key.accountId && x.program_id === key.programId),
          ),
        );

      return rows;
    });
  }

  get loaders() {
    return {
      ...super.loaders,
      byAccountIdAndProgramIdLoader: this.byAccountIdAndProgramIdLoader,
    };
  }

  loadByAccountIdAndProgramId(accountId: number, programId: number): Promise<AccountProgramType> {
    return this.byAccountIdAndProgramIdLoader.load({ accountId, programId });
  }
}
