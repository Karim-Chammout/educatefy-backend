import express from 'express';
import { createYoga } from 'graphql-yoga';

import { db } from '../db';
import { createLoaders } from './ctx/db';
import { createFsContext } from './ctx/fs';
import { createUserContext } from './ctx/user';
import Schema from './schema/Schema';

export const yoga = createYoga({
  schema: Schema,
  landingPage: false,
  graphqlEndpoint: '/',
  context: async (ctx) => {
    // @ts-ignore FIXME
    const { headers, tokenPayload, ip } = ctx.req;

    const user = await createUserContext(headers['user-agent'], tokenPayload, ip);

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
