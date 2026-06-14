import { describe, it, expect } from "vitest";
import { buildPiCommand } from "../src/pi/spawner";

describe("buildPiCommand", () => {
  it("includes --mode json, --print, --session-id", () => {
    const cmd = buildPiCommand({ sessionId: "abc", task: "hello", provider: "anthropic" });
    expect(cmd).toContain("--mode");
    expect(cmd[cmd.indexOf("--mode") + 1]).toBe("json");
    expect(cmd).toContain("--print");
    expect(cmd[cmd.indexOf("--session-id") + 1]).toBe("abc");
    expect(cmd[cmd.indexOf("--provider") + 1]).toBe("anthropic");
    expect(cmd[cmd.length - 1]).toBe("hello");
  });

  it("includes --model and --session-dir when provided", () => {
    const cmd = buildPiCommand({
      sessionId: "x",
      task: "y",
      sessionDir: "/tmp/sessions",
      model: "claude-opus-4-8",
    });
    expect(cmd).toContain("--model");
    expect(cmd[cmd.indexOf("--model") + 1]).toBe("claude-opus-4-8");
    expect(cmd).toContain("--session-dir");
    expect(cmd[cmd.indexOf("--session-dir") + 1]).toBe("/tmp/sessions");
  });
});
