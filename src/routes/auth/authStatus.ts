import { Request, Response } from 'express';

import { db } from '../../db/index.js';
import { ErrorType } from '../../utils/ErrorType.js';

export async function authStatus(req: Request, res: Response) {
  if (!req.tokenPayload) {
    res.status(401).json({ message: ErrorType.NOT_AUTHORIZED });
    return;
  }

  const account = await db('account')
    .join('account_role', 'account_role.id', 'account.role_id')
    .select('account.id', 'account_role.code as role')
    .where('account.id', req.tokenPayload.sub)
    .first();

  if (!account) {
    res.status(401).json({ message: ErrorType.NOT_AUTHORIZED });
    return;
  }

  res.json({ userId: account.id, role: account.role });
}
