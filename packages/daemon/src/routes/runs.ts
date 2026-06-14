import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import type { Run } from "@pi-studio/shared";

export async function runsRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/runs", async (req, reply) => {
    const body = req.body as { task?: string; provider?: string; model?: string; cwd?: string };
    if (!body?.task) return reply.code(400).send({ error: "task is required" });

    const run: Run = {
      id: randomUUID(),
      task: body.task,
      status: "running",
      startedAt: Date.now(),
      totalInput: 0,
      totalOutput: 0,
      totalCost: 0,
      agentCount: 0,
    };
    app.db.insertRun(run);
    return reply.code(201).send(run);
  });

  app.get("/api/runs", async (req) => {
    const limit = Number((req.query as { limit?: string }).limit ?? 100);
    return app.db.listRuns({ limit });
  });

  app.get<{ Params: { id: string } }>("/api/runs/:id", async (req, reply) => {
    const run = app.db.getRun(req.params.id);
    if (!run) return reply.code(404).send({ error: "not found" });
    return run;
  });

  app.post<{ Params: { id: string } }>("/api/runs/:id/cancel", async (req, reply) => {
    const run = app.db.getRun(req.params.id);
    if (!run) return reply.code(404).send({ error: "not found" });
    app.db.updateRun(req.params.id, { status: "cancelled", endedAt: Date.now() });
    return app.db.getRun(req.params.id);
  });
}
