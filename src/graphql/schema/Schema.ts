import fs from 'fs';
import { GraphQLSchema, printSchema } from 'graphql';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';

import config from '../../config.js';
import Mutation from './Mutation.js';
import Query from './Query.js';

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

if (config.APP_ENV === 'development') {
  const printedSchema = printSchema(Schema);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const location = path.resolve(__dirname, '..', '..', '..', 'schema.graphql');
  fs.writeFileSync(location, printedSchema);
}

export default Schema;
