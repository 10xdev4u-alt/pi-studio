import chokidar, { type FSWatcher } from "chokidar";
import { readFileSync } from "node:fs";

export interface TailerOptions {
  onLine: (line: string) => void;
  onError?: (err: Error) => void;
}

export class SessionTailer {
  private watcher: FSWatcher | null = null;
  private lastSize = 0;
  private filePath: string | null = null;

  constructor(private opts: TailerOptions) {}

  watch(filePath: string): void {
    this.filePath = filePath;
    this.lastSize = 0;
    this.readNew();

    this.watcher = chokidar.watch(filePath, {
      usePolling: true,
      interval: 100,
      awaitWriteFinish: false,
    });

    this.watcher.on("change", () => this.readNew());
    this.watcher.on("add", () => this.readNew());
    this.watcher.on("error", (err: unknown) => this.opts.onError?.(err instanceof Error ? err : new Error(String(err))));
  }

  private readNew(): void {
    if (!this.filePath) return;
    try {
      const content = readFileSync(this.filePath, "utf-8");
      if (content.length < this.lastSize) this.lastSize = 0;
      if (content.length <= this.lastSize) return;
      const newContent = content.slice(this.lastSize);
      this.lastSize = content.length;
      const lines = newContent.split("\n");
      for (const line of lines) {
        if (line.trim()) this.opts.onLine(line);
      }
    } catch (err) {
      this.opts.onError?.(err as Error);
    }
  }

  close(): void {
    this.watcher?.close();
    this.watcher = null;
    this.filePath = null;
  }
}
