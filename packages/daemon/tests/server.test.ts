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
});
