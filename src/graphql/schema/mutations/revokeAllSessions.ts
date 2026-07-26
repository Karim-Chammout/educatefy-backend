import { GraphQLFieldConfig } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { authenticated } from '../../utils/auth.js';
import MutationResult from '../types/MutationResult.js';

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

    await ctx
      .db('refresh_token')
      .where('account_id', ctx.user.id)
      .whereNull('revoked_at')
      .andWhere('token', '!=', currentToken)
      .update({
        revoked_at: ctx.db.fn.now(),
      });

    return {
      success: true,
      errors: [],
    };
  }),
};

export default revokeAllSessions;
