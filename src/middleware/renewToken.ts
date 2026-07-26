import { addDays, isPast } from 'date-fns';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import * as n from 'nanoid';

import config from '../config.js';
import { db } from '../db/index.js';
import { formatDateTZ } from '../utils/formatDateWithTZ.js';
import { tokenToRequest } from './attachToken.js';

const EXPIRING_SOON_SECONDS = 5 * 60; // 5 minutes

export const generateAndSetNewToken = async (payload: JwtPayload, req: Request, res: Response) => {
  const now = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      ...payload,
      nbf: now,
      iat: now,
      exp: now + 3600,
    },
    config.JWT_SECRET,
  );

  const isProduction = config.APP_ENV === 'production';
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 3600 * 1000,
  });

  res.set({
    'Access-Control-Expose-Headers': 'X-Renew-Token, X-Renew-Refresh-Token',
    'X-Renew-Token': token,
  });

  await tokenToRequest(token, req);
};

const processRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
  token: string,
  jwtPayload: JwtPayload | null,
) => {
  let refreshToken:
    | {
        id: number;
        account_id: number;
        expires_at: Date;
        revoked_at: Date | null;
        mobile: boolean;
        device: string | null;
        browser: string | null;
        country: string | null;
      }
    | undefined;

  try {
    refreshToken = await db('refresh_token').where('token', token).first();
  } catch (error) {
    console.error('Failed to query refresh token (transient):', error);
    return next();
  }

  if (!refreshToken) {
    req.tokenPayload = null;
    req.token = null;
    return next();
  }

  if (refreshToken.revoked_at) {
    const revokedSecondsAgo = (Date.now() - new Date(refreshToken.revoked_at).getTime()) / 1000;

    if (revokedSecondsAgo >= 30) {
      try {
        await db('refresh_token')
          .where('account_id', refreshToken.account_id)
          .update({ revoked_at: db.fn.now() });
      } catch (error) {
        console.error('Failed to revoke all tokens (transient):', error);
      }
    }

    req.tokenPayload = null;
    req.token = null;
    return next();
  }

  if (isPast(refreshToken.expires_at)) {
    req.tokenPayload = null;
    req.token = null;
    return next();
  }

  // Build the JWT payload: use the verified/expired JWT payload if available,
  // otherwise construct one from the refresh token's account_id (handles the
  // case where the JWT cookie has been deleted by the browser after its 1-hour
  // maxAge expired).
  const payload = jwtPayload || ({ sub: refreshToken.account_id } as unknown as JwtPayload);

  if (jwtPayload && Number(jwtPayload.sub) !== refreshToken.account_id) {
    req.tokenPayload = null;
    req.token = null;
    return next();
  }

  // Refresh token is valid — rotate it
  try {
    const currentDate = formatDateTZ(new Date());

    await db('refresh_token').where('id', refreshToken.id).update({
      revoked_at: currentDate,
      updated_at: currentDate,
      last_used_at: currentDate,
    });

    const newRefreshToken = n.nanoid();
    const expiresAt = formatDateTZ(addDays(new Date(), 7));

    await db('refresh_token').insert({
      account_id: refreshToken.account_id,
      token: newRefreshToken,
      mobile: refreshToken.mobile,
      device: refreshToken.device,
      browser: refreshToken.browser,
      ip: req.ip || '',
      country: refreshToken.country,
      expires_at: expiresAt,
    });

    res.set('X-Renew-Refresh-Token', newRefreshToken);

    await generateAndSetNewToken(payload, req, res);

    return next();
  } catch (error) {
    console.error('Failed to rotate refresh token (transient):', error);
    return next();
  }
};

export async function renewToken(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.headers.refreshtoken as string;

  if (!refreshToken) {
    return next();
  }

  // req.tokenPayload is set by attachToken when the JWT is valid.
  // If null, the JWT was missing/expired/invalid — we still attempt rotation
  // using the refresh token's account_id from the DB.
  const jwtPayload = req.tokenPayload;

  // If we have a valid JWT that's not expiring soon, skip rotation.
  if (jwtPayload) {
    const secondsUntilExpiry = (jwtPayload.exp || 0) - Math.floor(Date.now() / 1000);
    if (secondsUntilExpiry > EXPIRING_SOON_SECONDS) {
      return next();
    }
  }

  // JWT is expired, expiring soon, or missing — rotate via the refresh token.
  return processRefreshToken(req, res, next, refreshToken, jwtPayload);
}
