import { NextFunction, Request, Response } from 'express';

import { verifyJWT } from '../utils/jwt';

export const tokenToRequest = async (token: string, req: Request) => {
  if (token) {
    try {
      req.tokenPayload = await verifyJWT(token);
      req.token = token;
    } catch (_e) {
      req.tokenPayload = null;
      req.token = null;
    }
  }
};

export async function attachToken(req: Request, _res: Response, next: NextFunction) {
  // Initialize the properties
  if (!req.tokenPayload && !req.token) {
    req.tokenPayload = null;
    req.token = null;
  }

  let token: string | null = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return next();
  }

  await tokenToRequest(token, req);

  return next();
}
