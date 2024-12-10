import { JwtPayload } from 'jsonwebtoken';
import { Knex } from 'knex';

import { ReadersType } from '../graphql/ctx/db';

declare global {
  namespace Express {
    interface Request {
      tokenPayload: JwtPayload | null;
      token: string | null;
    }
  }
}

export type ContextType = {
  db: Knex;
  loaders: ReadersType;
};
