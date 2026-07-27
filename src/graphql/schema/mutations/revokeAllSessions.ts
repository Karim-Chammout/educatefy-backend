import { GraphQLFieldConfig } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { ErrorType } from '../../../utils/ErrorType.js';
import { authenticated } from '../../utils/auth.js';
import MutationResult from '../types/MutationResult.js';
import logger from '../../../utils/logger.js';

const revokeAllSessions: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Revokes all sessions except the current one.',
  resolve: authenticated(async (_, __, ctx) => {
    const currentToken = ctx.user.currentRefreshToken;

    if (!currentToken) {
      return {
        success: false,
        errors: [{ message: 'No current session found.' }],
      };
    }

    try {
      await ctx
        .db('refresh_token')
        .where('account_id', ctx.user.id)
        .whereNull('revoked_at')
        .andWhere('token', '!=', currentToken)
        .update({
          revoked_at: ctx.db.fn.now(),
        });

      logger.info({ userId: ctx.user.id }, 'All sessions revoked');

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      logger.error({ err: error, userId: ctx.user.id }, 'Failed to revoke all sessions');
      return {
        success: false,
        errors: [new Error(ErrorType.INTERNAL_SERVER_ERROR)],
      };
    }
  }),
};

export default revokeAllSessions;
