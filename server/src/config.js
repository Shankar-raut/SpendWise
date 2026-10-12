import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');

export const config = {
  rootDir,
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || './server/data/spendwise.sqlite',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173',
  authSecret: process.env.AUTH_SECRET || 'spendwise-local-development-secret'
};

export function resolveDatabasePath(databaseUrl = config.databaseUrl) {
  if (databaseUrl === ':memory:') {
    return databaseUrl;
  }

  if (databaseUrl.startsWith('file:')) {
    return new URL(databaseUrl);
  }

  return path.isAbsolute(databaseUrl)
    ? databaseUrl
    : path.resolve(rootDir, databaseUrl);
}
