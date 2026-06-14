import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../src/server";
import { createDatabase } from "../src/db/database";
import { EventBus } from "../src/sessions/event-bus";
import { RunManager } from "../src/sessions/run-manager";

describe("server with run manager", () => {
  let server: Awaited<ReturnType<typeof buildServer>>;
  let db: Awaited<ReturnType<typeof createDatabase>>;
  let bus: EventBus;
  let runManager: RunManager;
  beforeAll(async () => {
    db = await createDatabase(":memory:");
    bus = new EventBus();
    runManager = new RunManager({ bus });
    server = await buildServer({ port: 0, host: "127.0.0.1", database: db, bus, runManager });
    await server.listen({ port: 0, host: "127.0.0.1" });
  });
  afterAll(async () => {
    await server.close();
    db.close();
  });

  it("still has /api/health", async () => {
    const res = await server.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
  });
});
