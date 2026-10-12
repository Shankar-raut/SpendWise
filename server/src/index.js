import { createApp } from './app.js';
import { config } from './config.js';
import { getDb } from './db/client.js';
import { runMigrations } from './db/migrate.js';

const db = getDb();
runMigrations(db);

const app = createApp(db, { clientOrigin: config.clientOrigin });

app.listen(config.port, () => {
  console.log(`SpendWise API running on http://127.0.0.1:${config.port}`);
});
