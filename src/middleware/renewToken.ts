import { isPast } from 'date-fns';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import config from '../config';
import { db } from '../db';
import { formatDateTZ } from '../utils/formatDateWithTZ';
import { verifyJWT } from '../utils/jwt';
import { tokenToRequest } from './attachToken';

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

  res.set({
    'Access-Control-Expose-Headers': 'X-Renew-Token',
    'X-Renew-Token': token,
  });

  await tokenToRequest(token, req);
};

const processRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
  token: string,
  payload: JwtPayload,
) => {
  try {
    const refreshToken = await db('refresh_token').where('token', token).first();

    if (!isPast(refreshToken.expires_at) && payload.sub === refreshToken.account_id) {
      const currentDate = formatDateTZ(new Date());

      await db('refresh_token').where('id', refreshToken.id).update({
        last_used_at: currentDate,
        updated_at: currentDate,
      });

      await generateAndSetNewToken(payload, req, res);

      return next();
    }
  } catch (error) {
    console.log('Access with deleted access token', error);
  }

  // Invalid session, remove token from context
  req.tokenPayload = null;
  req.token = null;
  return next();
};

export async function renewToken(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.headers.refreshtoken as string;

  if (!refreshToken) {
    return next();
  }

  // Check if there is still a valid jwt
  if (req.tokenPayload && req.tokenPayload.iat) {
    // Renew the token if it is older than 15 minutes
    if ((req.tokenPayload.iat + 15 * 60) * 1000 < Date.now()) {
      return processRefreshToken(req, res, next, refreshToken, req.tokenPayload);
    }
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.substring(7);
    try {
      // Check if token is valid, expecting a token expired error
      await verifyJWT(token);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Token is signed correctly and only expired
        const payload = jwt.decode(token) as JwtPayload;
        return processRefreshToken(req, res, next, refreshToken, payload);
      }
    }
  }

  return next();
}
