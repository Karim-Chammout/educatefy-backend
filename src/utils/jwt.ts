import { addDays } from 'date-fns';
import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { Knex } from 'knex';
import * as n from 'nanoid';
import { UAParser } from 'ua-parser-js';

import config from '../config.js';
import { getCountryFromIp } from './getCountryFromIp.js';
import { formatDateTZ } from './formatDateWithTZ.js';

const storeRefreshToken = async (
  accountId: number,
  token: string,
  db: Knex,
  requestHeaders: Request['headers'],
  ip?: string,
) => {
  const rawBrowser = requestHeaders['user-agent'] || '';
  const expiresAt = formatDateTZ(addDays(new Date(), 7));

  const parser = new UAParser(rawBrowser);
  const deviceType = parser.getDevice().type || 'desktop';
  const isMobile = deviceType === 'mobile';

  let country = '';

  if (ip) {
    try {
      const resolved = await getCountryFromIp(ip);
      country = resolved || '';
    } catch (_err) {
      // GeoIP lookup failed — store empty string, don't block login
    }
  }

  await db('refresh_token').insert({
    account_id: accountId,
    token,
    mobile: isMobile,
    device: deviceType,
    browser: rawBrowser,
    ip: ip || '',
    country,
    expires_at: expiresAt,
  });
};

export async function generateRefreshToken(
  accountId: number,
  db: Knex,
  requestHeaders: Request['headers'],
  ip?: string,
) {
  const refreshToken = n.nanoid();

  await storeRefreshToken(accountId, refreshToken, db, requestHeaders, ip);

  return refreshToken;
}

export function generateAccessToken(accountId: number) {
  const jti = n.nanoid();

  return jwt.sign({ sub: accountId }, config.JWT_SECRET, {
    expiresIn: '1h',
    notBefore: 0,
    jwtid: jti,
  });
}

export function verifyJWT(token: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      return resolve(decoded as JwtPayload);
    });
  });
}

export function userIdFromToken(token: JwtPayload): number | null {
  if (typeof token.sub === 'string') {
    return parseInt(token.sub, 10);
  }

  if (typeof token.sub === 'number') {
    return token.sub;
  }

  return null;
}
