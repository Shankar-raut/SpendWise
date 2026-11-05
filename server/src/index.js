import { createApp } from './app.js';
import { config } from './config.js';
import { getDb } from './db/client.js';
import { runMigrations } from './db/migrate.js';

const db = getDb();
runMigrations(db);

const app = createApp(db, { clientOrigin: config.clientOrigin });

app.listen(config.port, '0.0.0.0', () => {
  console.log(`SpendWise API running on http://0.0.0.0:${config.port}`);
  console.log(`LAN access: http://10.196.216.112:${config.port}`);
});
