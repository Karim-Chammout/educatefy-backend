import { Knex } from 'knex';

import { OpenidClientReader } from './loaders/OpenidClient';

export type ReadersType = {
  OpenidClient: OpenidClientReader;
};

export function createLoaders(db: Knex): ReadersType {
  return {
    OpenidClient: new OpenidClientReader(db),
  };
}
