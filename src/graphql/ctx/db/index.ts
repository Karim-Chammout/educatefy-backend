import { Knex } from 'knex';

import { AccountReader } from './loaders/Account';
import { AccountRoleReader } from './loaders/AccountRole';
import { CountryReader } from './loaders/Country';
import { FileReader } from './loaders/File';
import { OpenidClientReader } from './loaders/OpenidClient';

export type ReadersType = {
  Account: AccountReader;
  AccountRole: AccountRoleReader;
  Country: CountryReader;
  File: FileReader;
  OpenidClient: OpenidClientReader;
};

export function createLoaders(db: Knex): ReadersType {
  return {
    Account: new AccountReader(db),
    AccountRole: new AccountRoleReader(db),
    Country: new CountryReader(db),
    File: new FileReader(db),
    OpenidClient: new OpenidClientReader(db),
  };
}
