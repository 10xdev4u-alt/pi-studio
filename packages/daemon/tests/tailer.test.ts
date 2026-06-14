import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SessionTailer } from "../src/sessions/tailer";

describe("SessionTailer", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
    dirs.length = 0;
  });

  it("emits parsed lines appended after start", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tailer-"));
    dirs.push(dir);
    const file = join(dir, "session.jsonl");
    writeFileSync(file, '{"type":"session","id":"r1"}\n');

    const received: unknown[] = [];
    const tailer = new SessionTailer({ onLine: (line) => received.push(JSON.parse(line)) });
    tailer.watch(file);

    await new Promise((r) => setTimeout(r, 200));
    writeFileSync(file, '{"type":"message","text":"hi"}\n', { flag: "a" });
    await new Promise((r) => setTimeout(r, 800));

    expect(received.length).toBeGreaterThanOrEqual(2);
    expect((received[received.length - 1] as { text: string }).text).toBe("hi");

    tailer.close();
  });
});
