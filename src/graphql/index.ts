import express from 'express';
import { createYoga } from 'graphql-yoga';

import Schema from './schema/Schema';

export const yoga = createYoga({
  schema: Schema,
  landingPage: false,
  graphqlEndpoint: '/',
});

export default function GraphQL() {
  const graphQLEndpoint = express();

  graphQLEndpoint.use(yoga.graphqlEndpoint, yoga);

  return graphQLEndpoint;
}
