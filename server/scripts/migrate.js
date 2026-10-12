import { getDb } from '../src/db/client.js';
import { runMigrations } from '../src/db/migrate.js';

runMigrations(getDb());
console.log('Database migrations applied.');
