import dotenv from 'dotenv';
import type { Knex } from 'knex';

dotenv.config();

interface KnexConfig {
  [key: string]: Knex.Config;
}

const config: KnexConfig = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'ts',
    },
  },
};

export default config;
