import express from 'express';
import { createYoga } from 'graphql-yoga';

import { db } from '../db/index.js';
import { createLoaders } from './ctx/db/index.js';
import { createFsContext } from './ctx/fs/index.js';
import { createUserContext } from './ctx/user/index.js';
import { useGraphQLLogger } from './plugins/useGraphQLLogger.js';
import Schema from './schema/Schema.js';

export const yoga = createYoga({
  schema: Schema,
  landingPage: false,
  graphqlEndpoint: '/',
  plugins: [useGraphQLLogger],
  context: async (ctx) => {
    // @ts-ignore FIXME
    const { headers, tokenPayload, ip } = ctx.req;

    const user = await createUserContext(
      headers['user-agent'],
      tokenPayload,
      ip,
      headers.refreshtoken,
    );

    return {
      user,
      db,
      loaders: { ...createLoaders(db) },
      fs: createFsContext(),
    };
  },
});

export default function GraphQL() {
  const graphQLEndpoint = express();

  graphQLEndpoint.use(yoga.graphqlEndpoint, yoga);

  return graphQLEndpoint;
}
