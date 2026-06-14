import { buildServer } from "./server.js";
import { createDatabase } from "./db/database.js";
import { EventBus } from "./sessions/event-bus.js";
import { RunManager } from "./sessions/run-manager.js";
import { setupGracefulShutdown } from "./lifecycle.js";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const port = Number(process.env.PI_STUDIO_PORT ?? 7331);
const host = process.env.PI_STUDIO_HOST ?? "127.0.0.1";
const dbPath = process.env.PI_STUDIO_DB ?? `${process.env.HOME}/.pi-studio/data.db`;

async function main(): Promise<void> {
  mkdirSync(dirname(dbPath), { recursive: true });
  const database = await createDatabase(dbPath);
  const bus = new EventBus();
  const runManager = new RunManager({ bus });
  const app = await buildServer({ port, host, database, bus, runManager });
  await app.listen({ port, host });
  console.log(`π studio daemon listening on http://${host}:${port}`);
  console.log(`  database: ${dbPath}`);

  setupGracefulShutdown(async () => {
    await app.close();
    database.close();
  });
}

main().catch((err: unknown) => {
  console.error("daemon failed to start:", err);
  process.exit(1);
});
