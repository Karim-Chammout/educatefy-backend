import { NextFunction, Request, Response } from 'express';

import { ErrorType } from '../utils/ErrorType';

export const authenticated = (req: Request, res: Response, next: NextFunction) => {
  const { token } = req;

  if (!token) {
    res.status(401).json({ message: ErrorType.NOT_AUTHORIZED });
    return;
  }

  // We already validated the token in the previous middleware (attachToken.ts) and remove it if it's invalid
  next();
};
