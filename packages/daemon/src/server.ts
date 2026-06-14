import Fastify, { type FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";
import type { PiStudioDatabase } from "./db/database.js";
import type { EventBus } from "./sessions/event-bus.js";
import type { RunManager } from "./sessions/run-manager.js";
import { runsRoutes } from "./routes/runs.js";
import { registerWebSocketRoute } from "./ws/fastify-route.js";

export interface ServerOptions {
  port: number;
  host: string;
  database: PiStudioDatabase;
  bus: EventBus;
  runManager: RunManager;
}

export async function buildServer(opts: ServerOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  app.decorate("db", opts.database);
  app.decorate("bus", opts.bus);
  app.decorate("runManager", opts.runManager);

  await app.register(websocket);
  await registerWebSocketRoute(app, { bus: opts.bus, port: 0, host: opts.host });

  app.get("/api/health", async () => ({ status: "ok", version: "0.1.0" }));
  await app.register(runsRoutes);

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    db: PiStudioDatabase;
    bus: EventBus;
    runManager: RunManager;
  }
}
