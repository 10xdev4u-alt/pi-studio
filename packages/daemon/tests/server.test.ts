import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../src/server";
import { createDatabase } from "../src/db/database";
import type { Run } from "../src/db/database";

const fixture: Run = {
  id: "r1",
  task: "test",
  status: "running",
  startedAt: Date.now(),
  totalInput: 0,
  totalOutput: 0,
  totalCost: 0,
  agentCount: 0,
};

describe("server with database", () => {
  let server: Awaited<ReturnType<typeof buildServer>>;
  let db: Awaited<ReturnType<typeof createDatabase>>;
  beforeAll(async () => {
    db = await createDatabase(":memory:");
    db.insertRun(fixture);
    server = await buildServer({ port: 0, host: "127.0.0.1", database: db });
    await server.listen({ port: 0, host: "127.0.0.1" });
  });
  afterAll(async () => {
    await server.close();
    db.close();
  });

  it("responds to /api/health with 200", async () => {
    const res = await server.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    expect((res.json() as { status: string }).status).toBe("ok");
  });

  it("POST /api/runs creates a run", async () => {
    const res = await server.inject({ method: "POST", url: "/api/runs", payload: { task: "test" } });
    expect(res.statusCode).toBe(201);
    const body = res.json() as { id: string; task: string; status: string };
    expect(body.id).toBeDefined();
    expect(body.task).toBe("test");
    expect(body.status).toBe("running");
  });

  it("POST /api/runs returns 400 without task", async () => {
    const res = await server.inject({ method: "POST", url: "/api/runs", payload: {} });
    expect(res.statusCode).toBe(400);
  });

  it("GET /api/runs lists runs", async () => {
    const res = await server.inject({ method: "GET", url: "/api/runs" });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json())).toBe(true);
  });

  it("GET /api/runs/:id returns 404 for unknown id", async () => {
    const res = await server.inject({ method: "GET", url: "/api/runs/does-not-exist" });
    expect(res.statusCode).toBe(404);
  });

  it("POST /api/runs/:id/cancel cancels a run", async () => {
    const create = await server.inject({ method: "POST", url: "/api/runs", payload: { task: "to-cancel" } });
    const id = (create.json() as { id: string }).id;
    const cancel = await server.inject({ method: "POST", url: `/api/runs/${id}/cancel` });
    expect(cancel.statusCode).toBe(200);
    expect((cancel.json() as { status: string }).status).toBe("cancelled");
  });
});
