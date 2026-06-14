import Fastify, { type FastifyInstance } from "fastify";
import type { PiStudioDatabase } from "./db/database.js";
import { runsRoutes } from "./routes/runs.js";

export interface ServerOptions {
  port: number;
  host: string;
  database: PiStudioDatabase;
}

export async function buildServer(opts: ServerOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  app.decorate("db", opts.database);

  app.get("/api/health", async () => ({ status: "ok", version: "0.1.0" }));
  await app.register(runsRoutes);

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    db: PiStudioDatabase;
  }
}
