import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb } from './db.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function main() {
  await connectDb();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`[server] KrishnaOS API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[server] Fatal error during startup:', err);
  process.exit(1);
});
