export type RunStatus = "running" | "done" | "failed" | "cancelled";

export interface Run {
  id: string;
  task: string;
  status: RunStatus;
  startedAt: number;
  endedAt?: number;
  cwd?: string;
  totalInput: number;
  totalOutput: number;
  totalCost: number;
  agentCount: number;
  errorMessage?: string;
}

export interface RunSummary {
  id: string;
  task: string;
  status: RunStatus;
  duration: number;
  cost: number;
  agentCount: number;
  startedAt: number;
}
