import { spawn, type ChildProcess } from "node:child_process";

export interface PiSpawnOptions {
  sessionId: string;
  task: string;
  cwd?: string;
  provider?: string;
  model?: string;
  sessionDir?: string;
  onStdoutLine?: (line: string) => void;
  onStderrLine?: (line: string) => void;
  onExit?: (code: number | null) => void;
}

export function buildPiCommand(opts: PiSpawnOptions): string[] {
  const cmd: string[] = [];
  cmd.push("--mode", "json");
  cmd.push("--print");
  cmd.push("--session-id", opts.sessionId);
  if (opts.sessionDir) cmd.push("--session-dir", opts.sessionDir);
  if (opts.provider) cmd.push("--provider", opts.provider);
  if (opts.model) cmd.push("--model", opts.model);
  cmd.push(opts.task);
  return cmd;
}

function attachLineReader(stream: NodeJS.ReadableStream | null, cb: (line: string) => void): void {
  if (!stream) return;
  let buf = "";
  stream.setEncoding("utf-8");
  stream.on("data", (chunk: string) => {
    buf += chunk;
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) cb(line);
    }
  });
}

export function spawnPi(opts: PiSpawnOptions): ChildProcess {
  const args = buildPiCommand(opts);
  const child = spawn("pi", args, {
    cwd: opts.cwd ?? process.cwd(),
    env: { ...process.env },
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (opts.onStdoutLine) attachLineReader(child.stdout, opts.onStdoutLine);
  if (opts.onStderrLine) attachLineReader(child.stderr, opts.onStderrLine);
  child.on("exit", (code) => opts.onExit?.(code));
  return child;
}
