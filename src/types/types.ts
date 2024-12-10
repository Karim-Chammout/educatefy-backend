import { Knex } from 'knex';

import { ReadersType } from '../graphql/ctx/db';

export type ContextType = {
  db: Knex;
  loaders: ReadersType;
};
