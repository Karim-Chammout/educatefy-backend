import express from 'express';
import { createYoga } from 'graphql-yoga';

import { db } from '../db';
import { createLoaders } from './ctx/db';
import Schema from './schema/Schema';

export const yoga = createYoga({
  schema: Schema,
  landingPage: false,
  graphqlEndpoint: '/',
  context: async (ctx) => {
    return {
      db,
      loaders: { ...createLoaders(db) },
    };
  },
});

export default function GraphQL() {
  const graphQLEndpoint = express();

  graphQLEndpoint.use(yoga.graphqlEndpoint, yoga);

  return graphQLEndpoint;
}
