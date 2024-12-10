import { JwtPayload } from 'jsonwebtoken';

import { db } from '../../../db';
import { UserContext } from '../../../types/types';
import { userIdFromToken } from '../../../utils/jwt';

export async function createUserContext(
  userAgent: string,
  tokenPayload?: JwtPayload | null,
  ip?: string,
): Promise<UserContext> {
  if (tokenPayload) {
    const id = userIdFromToken(tokenPayload);

    if (id) {
      const userData: {
        roleId: number;
        countryId?: number;
      } = await db
        .raw(
          `
          SELECT
            account.country_id as "countryId",
            account.role_id as "roleId"
          FROM account
          JOIN account_role ON account_role.id = account.role_id
          WHERE account.id = ${id}
        `,
        )
        .then((res) => res.rows[0]);

      return {
        authenticated: true,
        id,
        ip: ip || '',
        userAgent,
        roleId: userData.roleId,
        countryId: userData.countryId,
      };
    }
  }

  return {
    authenticated: false,
    ip: ip || '',
    userAgent,
  };
}
