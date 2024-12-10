import { GraphQLError, GraphQLFieldResolver } from 'graphql';

import { AuthenticatedCtxType, ContextType } from '../../types/types';
import { ErrorType } from '../../utils/ErrorType';

/**
 * This resolver function can wrap a normal resolver function. It makes sure that there is a user
 * id property available in the context argument and errors if this is not the case.
 */
export function authenticated<TSource, TArgs, TContext extends ContextType>(
  resolver: GraphQLFieldResolver<TSource, AuthenticatedCtxType, TArgs>,
): GraphQLFieldResolver<TSource, TContext, TArgs> {
  return (source, args, context, info) => {
    if (!context.user.authenticated) {
      throw new GraphQLError(ErrorType.UNAUTHENTICATED, {
        extensions: {
          code: ErrorType.NOT_AUTHORIZED,
          http: {
            status: 401,
          },
        },
      });
    }

    // If the user is authenticated, call the original resolver
    return resolver(source, args, context as AuthenticatedCtxType, info);
  };
}
