import type { Run, RunSummary } from "@pi-studio/shared";

export class StudioApi {
  constructor(private baseUrl: string) {}

  async listRuns(): Promise<RunSummary[]> {
    const r = await fetch(`${this.baseUrl}/api/runs`);
    if (!r.ok) throw new Error(`listRuns failed: ${r.status}`);
    return r.json() as Promise<RunSummary[]>;
  }

  async getRun(id: string): Promise<Run> {
    const r = await fetch(`${this.baseUrl}/api/runs/${id}`);
    if (!r.ok) throw new Error(`getRun failed: ${r.status}`);
    return r.json() as Promise<Run>;
  }

  async startRun(task: string, opts?: { provider?: string; model?: string; cwd?: string }): Promise<Run> {
    const r = await fetch(`${this.baseUrl}/api/runs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task, ...opts }),
    });
    if (!r.ok) throw new Error(`startRun failed: ${r.status}`);
    return r.json() as Promise<Run>;
  }

  async cancelRun(id: string): Promise<Run> {
    const r = await fetch(`${this.baseUrl}/api/runs/${id}/cancel`, { method: "POST" });
    if (!r.ok) throw new Error(`cancelRun failed: ${r.status}`);
    return r.json() as Promise<Run>;
  }

  async health(): Promise<{ status: string }> {
    const r = await fetch(`${this.baseUrl}/api/health`);
    return r.json() as Promise<{ status: string }>;
  }
}
