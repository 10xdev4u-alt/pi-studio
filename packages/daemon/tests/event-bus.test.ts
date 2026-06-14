import { describe, it, expect } from "vitest";
import { EventBus } from "../src/sessions/event-bus";
import type { Event } from "@pi-studio/shared";

describe("EventBus", () => {
  it("emits events to subscribers", () => {
    const bus = new EventBus();
    const received: Event[] = [];
    bus.subscribe("r1", (e) => received.push(e));
    const event: Event = { type: "session_start", runId: "r1", task: "x", agents: [] };
    bus.publish(event);
    expect(received).toHaveLength(1);
    expect(received[0]?.type).toBe("session_start");
  });

  it("filters by runId", () => {
    const bus = new EventBus();
    const r1: Event[] = [];
    const r2: Event[] = [];
    bus.subscribe("r1", (e) => r1.push(e));
    bus.subscribe("r2", (e) => r2.push(e));
    bus.publish({ type: "session_start", runId: "r1", task: "x", agents: [] });
    bus.publish({ type: "session_start", runId: "r2", task: "y", agents: [] });
    expect(r1).toHaveLength(1);
    expect(r2).toHaveLength(1);
  });

  it("wildcard subscribers receive all events", () => {
    const bus = new EventBus();
    const all: Event[] = [];
    bus.subscribe(null, (e) => all.push(e));
    bus.publish({ type: "session_start", runId: "a", task: "x", agents: [] });
    bus.publish({ type: "session_start", runId: "b", task: "y", agents: [] });
    expect(all).toHaveLength(2);
  });

  it("unsubscribe stops delivery", () => {
    const bus = new EventBus();
    const received: Event[] = [];
    const unsub = bus.subscribe("r1", (e) => received.push(e));
    unsub();
    bus.publish({ type: "session_start", runId: "r1", task: "x", agents: [] });
    expect(received).toHaveLength(0);
  });
});
