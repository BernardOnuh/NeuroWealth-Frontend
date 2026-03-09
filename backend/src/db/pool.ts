/**
 * PostgreSQL connection pool
 * 
 * Singleton pool instance for database connections.
 * Configured via environment variables.
 */

import { Pool } from 'pg';
import { logger } from '../utils/logger';

const IS_TEST = process.env.NODE_ENV === 'test';

// Minimal fake pool implementing only what's used
const testPool: any = {
  query: async () => ({ rows: [], rowCount: 0 }),
  on: () => {},
  end: async () => {},
};

const realPool =
  new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'neurowealth',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

const pool: any = IS_TEST ? testPool : realPool;

if (!IS_TEST) {
  pool.on('error', (err: Error) => {
    logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
  });

  pool
    .query('SELECT NOW()')
    .then(() => {
      logger.info('PostgreSQL connection pool initialized successfully');
    })
    .catch((err: Error) => {
      logger.error({ err }, 'Failed to initialize PostgreSQL connection pool');
    });
}

export default pool as Pool;
