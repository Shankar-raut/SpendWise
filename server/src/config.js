import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');

const defaultClientOrigin = process.env.CLIENT_ORIGIN || 'http://10.196.216.112:5173';

export const config = {
  rootDir,
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || './server/data/spendwise.sqlite',
  clientOrigin: defaultClientOrigin,
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
