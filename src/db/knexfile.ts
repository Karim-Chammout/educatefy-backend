import dotenv from 'dotenv';
import { Knex } from 'knex';

dotenv.config({ path: '../../.env' });

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'migrations',
    directory: './migrations',
  },
};

export default knexConfig;
