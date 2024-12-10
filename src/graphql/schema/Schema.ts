import fs from 'fs';
import { GraphQLSchema, printSchema } from 'graphql';
import path from 'path';

import config from '../../config';
import Mutation from './Mutation';
import Query from './Query';

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

if (config.APP_ENV === 'development') {
  const printedSchema = printSchema(Schema);
  const location = path.resolve(__dirname, '..', '..', '..', 'schema.graphql');
  fs.writeFileSync(location, printedSchema);
}

export default Schema;
