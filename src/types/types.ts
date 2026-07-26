import { JwtPayload } from 'jsonwebtoken';
import type { Knex } from 'knex';

import { ReadersType } from '../graphql/ctx/db/index.js';
import { FsContext } from '../graphql/ctx/fs/index.js';

declare global {
  namespace Express {
    interface Request {
      tokenPayload: JwtPayload | null;
      token: string | null;
    }
  }
}

type BaseUserContext = {
  ip: string;
  userAgent: string;
  currentRefreshToken?: string;
};

export type AuthenticatedUserContext = BaseUserContext & {
  id: number;
  authenticated: true;
  roleId: number;
  countryId?: number | null;
};

export type PublicUserContext = BaseUserContext & {
  authenticated: false;
};

export type UserContext = AuthenticatedUserContext | PublicUserContext;

export type ContextType = {
  user: UserContext;
  db: Knex;
  loaders: ReadersType;
  fs: FsContext;
};

export type AuthenticatedCtxType = {
  user: AuthenticatedUserContext;
  db: Knex;
  loaders: ReadersType;
  fs: FsContext;
};
