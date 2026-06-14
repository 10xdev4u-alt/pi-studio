import { describe, it, expect } from "vitest";
import { EventBus } from "../src/sessions/event-bus";
import { RunManager } from "../src/sessions/run-manager";

describe("RunManager", () => {
  it("publishes events to the bus from a run", async () => {
    const bus = new EventBus();
    const received: string[] = [];
    bus.subscribe(null, (e) => received.push(e.type));

    const mgr = new RunManager({ bus });
    await mgr.startRun({
      sessionId: "test-rm-1",
      task: "hello",
      binary: "echo", // override for the test
      args: ["hello from run-manager"],
    });

    await new Promise((r) => setTimeout(r, 500));
    expect(received).toContain("session_start");
    expect(received).toContain("session_end");
  }, 10000);
});
