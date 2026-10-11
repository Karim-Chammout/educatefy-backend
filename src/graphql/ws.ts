import type { Server as HttpServer } from 'node:http';

import { useServer } from 'graphql-ws/use/ws';
import { WebSocketServer } from 'ws';
import type { JwtPayload } from 'jsonwebtoken';

import { db } from '../db/index.js';
import { createLoaders } from './ctx/db/index.js';
import { createFsContext } from './ctx/fs/index.js';
import { createUserContext } from './ctx/user/index.js';
import Schema from './schema/Schema.js';
import { ContextType } from '../types/types.js';
import logger from '../utils/logger.js';
import { verifyJWT } from '../utils/jwt.js';

const WS_PATH = '/graphql';

type WsExtra = { jwt: JwtPayload | null };

function normalizeToken(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.replace(/^Bearer\s+/i, '').trim() || null;
  }

  if (Array.isArray(value)) {
    const first = value.find((entry) => typeof entry === 'string');

    return typeof first === 'string' ? first.replace(/^Bearer\s+/i, '').trim() || null : null;
  }

  return null;
}

function tokenFromCookie(header: string | undefined): string | null {
  if (!header) {
    return null;
  }

  for (const pair of header.split(';')) {
    const separator = pair.indexOf('=');

    if (separator === -1 || pair.slice(0, separator).trim() !== 'jwt') {
      continue;
    }

    const value = pair.slice(separator + 1).trim();

    return value || null;
  }

  return null;
}

export function attachWebSocketServer(server: HttpServer): WebSocketServer {
  const wsServer = new WebSocketServer({ server, path: WS_PATH });

  useServer<Record<string, unknown>, WsExtra>(
    {
      schema: Schema,

      onConnect: async (context) => {
        const params = (context.connectionParams ?? {}) as Record<string, unknown>;

        const token =
          normalizeToken(
            params.authorization ?? params.Authorization ?? params.token ?? params.jwt,
          ) ?? tokenFromCookie(context.extra.request.headers.cookie);

        if (!token) {
          return false;
        }

        try {
          context.extra.jwt = await verifyJWT(token);
        } catch (_error) {
          return false;
        }

        return true;
      },

      context: async (context): Promise<ContextType> => {
        const { request } = context.extra;

        const user = await createUserContext(
          request.headers['user-agent'] ?? '',
          context.extra.jwt,
          request.socket.remoteAddress ?? '',
        );

        return {
          user,
          db,
          loaders: { ...createLoaders(db) },
          fs: createFsContext(),
        };
      },

      onError: (_context, _message, errors) => {
        logger.error({ err: errors }, 'graphql-ws: operation error');
      },

      onSubscribe: (_context, _id, payload) => {
        logger.debug(
          { operation: payload.operationName ?? 'anonymous' },
          'graphql-ws: subscription started',
        );
      },
    },
    wsServer,
  );

  logger.info({ path: WS_PATH }, 'graphql: WebSocket server attached');

  return wsServer;
}

export { WS_PATH };
