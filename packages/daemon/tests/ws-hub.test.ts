import { describe, it, expect, afterEach } from "vitest";
import { EventBus } from "../src/sessions/event-bus";
import { WebSocketHub } from "../src/ws/hub";
import { WebSocket as WSClient } from "ws";

describe("WebSocketHub", () => {
  const cleanups: (() => void)[] = [];

  afterEach(() => {
    for (const c of cleanups) c();
    cleanups.length = 0;
  });

  it("broadcasts events from the bus to subscribed clients", async () => {
    const bus = new EventBus();
    const hub = new WebSocketHub({ bus, port: 0, host: "127.0.0.1" });
    const port = await hub.start();
    cleanups.push(() => hub.close());

    const client = new WSClient(`ws://127.0.0.1:${port}`);
    const received: unknown[] = [];
    client.on("message", (data) => received.push(JSON.parse(data.toString())));
    await new Promise<void>((r) => client.on("open", () => r()));
    client.send(JSON.stringify({ type: "subscribe", runId: "r1" }));
    await new Promise((r) => setTimeout(r, 100));

    bus.publish({ type: "session_start", runId: "r1", task: "x", agents: [] });
    await new Promise((r) => setTimeout(r, 200));

    expect(received.length).toBeGreaterThanOrEqual(1);
    expect((received[0] as { type: string }).type).toBe("event");
    cleanups.push(() => client.close());
  });
});
