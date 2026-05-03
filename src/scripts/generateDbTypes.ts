import 'dotenv/config';
import { updateTypes } from 'knex-types';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';

import { db } from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = path.join(__dirname, '..', 'types', 'db-generated-types.ts');

updateTypes(db, { output: outputPath }).catch((err) => {
  console.error(err);
  process.exit(1);
});
