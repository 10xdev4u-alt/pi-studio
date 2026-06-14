import { describe, it, expect } from "vitest";
import type { Event } from "../src/events.js";
import { isEvent } from "../src/events.js";

describe("Event types", () => {
  it("session_start has a runId and task", () => {
    const e: Event = {
      type: "session_start",
      runId: "r1",
      task: "build it",
      agents: ["scout"],
    };
    expect(e.runId).toBe("r1");
    expect(e.task).toBe("build it");
  });

  it("isEvent returns true for valid events", () => {
    const e = { type: "session_start", runId: "r1", task: "x", agents: [] };
    expect(isEvent(e)).toBe(true);
  });

  it("isEvent returns false for non-events", () => {
    expect(isEvent({})).toBe(false);
    expect(isEvent({ type: 123 })).toBe(false);
    expect(isEvent(null)).toBe(false);
    expect(isEvent("foo")).toBe(false);
  });
});
