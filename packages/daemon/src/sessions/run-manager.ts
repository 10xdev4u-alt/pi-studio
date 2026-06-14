import { spawn, type ChildProcess } from "node:child_process";
import { join } from "node:path";
import { readdirSync } from "node:fs";
import { homedir } from "node:os";
import { EventBus } from "./event-bus.js";
import { SessionTailer } from "./tailer.js";
import type { Event } from "@pi-studio/shared";
import { isEvent } from "@pi-studio/shared";

export interface RunManagerOptions {
  bus: EventBus;
  defaultSessionDir?: string;
}

export interface StartRunOptions {
  sessionId: string;
  task: string;
  cwd?: string;
  provider?: string;
  model?: string;
  binary?: string; // override for testing
  args?: string[]; // override for testing
  sessionDir?: string;
}

interface ActiveRun {
  child: ChildProcess;
  tailer: SessionTailer | null;
}

export class RunManager {
  private active = new Map<string, ActiveRun>();

  constructor(private opts: RunManagerOptions) {}

  async startRun(opts: StartRunOptions): Promise<void> {
    const sessionDir = opts.sessionDir ?? this.opts.defaultSessionDir ?? join(homedir(), ".pi/agent/sessions");
    const cwd = opts.cwd ?? process.cwd();
    const binary = opts.binary ?? "pi";
    const args = opts.args ?? this.buildPiArgs({ ...opts, sessionDir });

    this.opts.bus.publish({
      type: "session_start",
      runId: opts.sessionId,
      task: opts.task,
      agents: [],
      cwd,
    });

    const child = spawn(binary, args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
    const tailer = this.attachTailer(sessionDir, opts.sessionId);

    this.attachStdoutReader(child, opts.sessionId);
    child.stderr?.setEncoding("utf-8");
    child.stderr?.on("data", (chunk: string) => process.stderr.write(`[pi stderr] ${chunk}`));

    child.on("exit", (code) => {
      this.opts.bus.publish({
        type: "session_end",
        runId: opts.sessionId,
        status: code === 0 ? "done" : "failed",
        ...(code !== 0 ? { error: `exit code ${code}` } : {}),
      });
      tailer?.close();
      this.active.delete(opts.sessionId);
    });

    this.active.set(opts.sessionId, { child, tailer });
  }

  cancel(sessionId: string): boolean {
    const entry = this.active.get(sessionId);
    if (!entry) return false;
    entry.child.kill("SIGTERM");
    return true;
  }

  private buildPiArgs(opts: StartRunOptions & { sessionDir: string }): string[] {
    const args: string[] = ["--mode", "json", "--print", "--session-id", opts.sessionId, "--session-dir", opts.sessionDir];
    if (opts.provider) args.push("--provider", opts.provider);
    if (opts.model) args.push("--model", opts.model);
    args.push(opts.task);
    return args;
  }

  private attachTailer(sessionDir: string, sessionId: string): SessionTailer | null {
    const file = this.findSessionFile(sessionDir, sessionId);
    if (!file) return null;
    const tailer = new SessionTailer({
      onLine: (line) => this.handleRawLine(sessionId, line),
    });
    tailer.watch(file);
    return tailer;
  }

  private attachStdoutReader(child: ChildProcess, sessionId: string): void {
    let buf = "";
    child.stdout?.setEncoding("utf-8");
    child.stdout?.on("data", (chunk: string) => {
      buf += chunk;
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) this.handleRawLine(sessionId, line);
    });
  }

  private findSessionFile(sessionDir: string, sessionId: string): string | null {
    try {
      const cwdEncoded = process.cwd().replace(/[/]/g, "-");
      const subdir = join(sessionDir, cwdEncoded);
      const files = readdirSync(subdir).filter((f) => f.includes(sessionId));
      if (files[0]) return join(subdir, files[0]);
    } catch {
      /* dir doesn't exist yet */
    }
    return null;
  }

  private handleRawLine(sessionId: string, line: string): void {
    if (!line.trim()) return;
    try {
      const parsed = JSON.parse(line) as { type?: string };
      if (isEvent(parsed)) {
        this.opts.bus.publish(parsed as Event);
      } else if (parsed.type) {
        this.opts.bus.publish({
          type: "message",
          runId: sessionId,
          agent: "pi",
          role: "assistant",
          content: JSON.stringify(parsed),
        });
      }
    } catch {
      this.opts.bus.publish({
        type: "message",
        runId: sessionId,
        agent: "pi",
        role: "assistant",
        content: line,
      });
    }
  }
}
