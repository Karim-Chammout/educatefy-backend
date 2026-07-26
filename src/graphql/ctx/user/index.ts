import { JwtPayload } from 'jsonwebtoken';

import { db } from '../../../db/index.js';
import { UserContext } from '../../../types/types.js';
import { userIdFromToken } from '../../../utils/jwt.js';

export async function createUserContext(
  userAgent: string,
  tokenPayload?: JwtPayload | null,
  ip?: string,
  currentRefreshToken?: string,
): Promise<UserContext> {
  if (tokenPayload) {
    const id = userIdFromToken(tokenPayload);

    if (id) {
      const userData: {
        roleId: number;
        countryId?: number;
      } = await db('account')
        .join('account_role', 'account_role.id', 'account.role_id')
        .select('account.country_id as countryId', 'account.role_id as roleId')
        .where('account.id', id)
        .first();

      return {
        authenticated: true,
        id,
        ip: ip || '',
        userAgent,
        roleId: userData.roleId,
        countryId: userData.countryId,
        currentRefreshToken,
      };
    }
  }

  return {
    authenticated: false,
    ip: ip || '',
    userAgent,
    currentRefreshToken,
  };
}
