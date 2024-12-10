import { addDays } from 'date-fns';
import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Knex } from 'knex';
import * as n from 'nanoid';

import config from '../config';
import { formatDateTZ } from './formatDateWithTZ';

export class TokenInvalidError extends Error {
  constructor() {
    super('The provided token is invalid!');
  }
}

const storeRefreshToken = async (
  accountId: string,
  token: string,
  db: Knex,
  requestHeaders: Request['headers'],
) => {
  try {
    const browser = requestHeaders['user-agent'];
    const expiresAt = formatDateTZ(addDays(new Date(), 7)); // Valid for seven days

    await db('refresh_token').insert({
      account_id: accountId,
      token,
      // might update this in the future to check if users are coming from mobile devices
      mobile: false,
      browser,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.log('Error occurred while storing refresh_token, error => ', error);
  }
};

export async function generateRefreshToken(
  accountId: string,
  db: Knex,
  requestHeaders: Request['headers'],
) {
  const refreshToken = n.nanoid();

  // Store refresh token in the database
  await storeRefreshToken(accountId, refreshToken, db, requestHeaders);

  return refreshToken;
}

export function generateAccessToken(accountId: string) {
  const jti = n.nanoid();

  return jwt.sign({ sub: accountId }, config.JWT_SECRET, {
    expiresIn: '1h',
    notBefore: 0,
    jwtid: jti,
  });
}

export function verifyJWT(token: string): Promise<JwtPayload> {
  const secret = config.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT secret not found in environment!');
  }

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secret,
      {
        algorithms: ['HS256'],
      },
      (err, decoded) => {
        if (err) {
          if (err instanceof jwt.TokenExpiredError) {
            return reject(err);
          }
          return reject(new TokenInvalidError());
        }
        return resolve(decoded as JwtPayload);
      },
    );
  });
}

export function userIdFromToken(token: JwtPayload): number | null {
  try {
    if (typeof token.sub === 'string') {
      return parseInt(token.sub, 10);
    }

    if (!token.sub) return null;

    return token.sub;
  } catch (error: any) {
    return null;
  }
}
