import Fastify, { type FastifyInstance } from "fastify";

export interface ServerOptions {
  port: number;
  host: string;
}

export async function buildServer(opts: ServerOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.get("/api/health", async () => ({ status: "ok", version: "0.1.0" }));

  return app;
}
