import { describe, it, expect, vi } from "vitest";
import { StudioClient } from "../src/lib/ws";

describe("StudioClient", () => {
  it("can be constructed with required options", () => {
    const onEvent = vi.fn();
    const client = new StudioClient({ url: "ws://test", onEvent });
    expect(client).toBeDefined();
    client.close();
  });
});
