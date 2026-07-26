import { GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from 'graphql';

import { ContextType } from '../../../types/types.js';
import { authenticated } from '../../utils/auth.js';
import MutationResult from '../types/MutationResult.js';

const revokeDeviceSessions: GraphQLFieldConfig<null, ContextType> = {
  type: MutationResult,
  description: 'Revokes all sessions on a specific device (by raw browser User-Agent string).',
  args: {
    deviceBrowser: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The raw browser User-Agent string identifying the device.',
    },
  },
  resolve: authenticated(async (_, { deviceBrowser }: { deviceBrowser: string }, ctx) => {
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
      .andWhere('browser', deviceBrowser)
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

export default revokeDeviceSessions;
