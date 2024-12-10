import { Knex } from 'knex';

import { AccountReader } from './loaders/Account';
import { AccountRoleReader } from './loaders/AccountRole';
import { CountryReader } from './loaders/Country';
import { OpenidClientReader } from './loaders/OpenidClient';

export type ReadersType = {
  Account: AccountReader;
  AccountRole: AccountRoleReader;
  Country: CountryReader;
  OpenidClient: OpenidClientReader;
};

export function createLoaders(db: Knex): ReadersType {
  return {
    Account: new AccountReader(db),
    AccountRole: new AccountRoleReader(db),
    Country: new CountryReader(db),
    OpenidClient: new OpenidClientReader(db),
  };
}
