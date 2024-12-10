import 'dotenv/config';
import { updateTypes } from 'knex-types';
import path from 'path';

import { db } from '../db';

const outputPath = path.join(__dirname, '..', 'types', 'db-generated-types.ts');

updateTypes(db, { output: outputPath }).catch((err) => {
  console.error(err);
  process.exit(1);
});
