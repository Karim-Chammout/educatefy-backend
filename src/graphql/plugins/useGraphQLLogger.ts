import { DocumentNode, OperationDefinitionNode } from 'graphql';
import { useLogger } from 'graphql-yoga';

import logger from '../../utils/logger.js';

const operationStartTimes = new WeakMap<object, number>();

function getOperationInfo(document: DocumentNode): { type: string; name: string } {
  const op = document.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition',
  );

  return {
    type: op?.operation ?? 'unknown',
    name: op?.name?.value ?? 'anonymous',
  };
}

export const useGraphQLLogger = useLogger({
  skipIntrospection: true,
  logFn: (eventName: string, payload: Record<string, unknown>) => {
    if (eventName === 'execute-start') {
      const ctx = (payload.args as { contextValue?: object })?.contextValue;

      if (ctx) {
        operationStartTimes.set(ctx, performance.now());
      }

      return;
    }

    if (eventName === 'execute-end') {
      const { args, result } = payload as {
        args: {
          operationName?: string;
          document?: DocumentNode;
          contextValue?: { user?: { id?: number } };
        };
        result?: {
          errors?: Array<{ message: string; path?: Array<string | number> }>;
        };
      };

      const ctx = args?.contextValue;
      const startTime = ctx ? operationStartTimes.get(ctx) : undefined;
      const duration =
        startTime != null ? Math.round((performance.now() - startTime) * 100) / 100 : undefined;
      if (ctx) operationStartTimes.delete(ctx);

      const hasErrors = result?.errors && result.errors.length > 0;
      if (!hasErrors) return;

      const operationName = args.operationName ?? 'anonymous';
      const operationType = args.document ? getOperationInfo(args.document).type : 'unknown';

      logger.error(
        {
          userId: ctx?.user?.id,
          operation: operationName,
          type: operationType,
          duration,
          errors: result!.errors!.map((e) => ({
            message: e.message,
            path: e.path,
          })),
        },
        `GraphQL ${operationType} "${operationName}" failed`,
      );
    }
  },
});
