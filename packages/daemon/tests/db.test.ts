import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createDatabase } from "../src/db/database";
import type { Run } from "@pi-studio/shared";

function makeRun(id: string, status: Run["status"] = "running"): Run {
  return {
    id,
    task: `task-${id}`,
    status,
    startedAt: Date.now(),
    totalInput: 0,
    totalOutput: 0,
    totalCost: 0,
    agentCount: 0,
  };
}

describe("database", () => {
  let db: Awaited<ReturnType<typeof createDatabase>>;
  beforeEach(async () => {
    db = await createDatabase(":memory:");
  });
  afterEach(() => {
    db.close();
  });

  it("inserts a run and reads it back", () => {
    db.insertRun(makeRun("r1"));
    const run = db.getRun("r1");
    expect(run?.id).toBe("r1");
    expect(run?.status).toBe("running");
  });

  it("updates a run with a partial patch", () => {
    db.insertRun(makeRun("r2"));
    db.updateRun("r2", { status: "done", endedAt: 1234, totalCost: 0.42 });
    const run = db.getRun("r2");
    expect(run?.status).toBe("done");
    expect(run?.endedAt).toBe(1234);
    expect(run?.totalCost).toBe(0.42);
  });

  it("returns null for unknown ids", () => {
    expect(db.getRun("nope")).toBeNull();
  });

  it("lists runs with status filter", () => {
    db.insertRun(makeRun("a", "running"));
    db.insertRun(makeRun("b", "done"));
    db.insertRun(makeRun("c", "running"));
    const running = db.listRuns({ status: "running" });
    expect(running.map((r) => r.id).sort()).toEqual(["a", "c"]);
  });
});
