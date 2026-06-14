import { create } from "zustand";
import type { Event, Run, RunSummary } from "@pi-studio/shared";

interface RunState {
  runs: Map<string, Run>;
  events: Map<string, Event[]>;
  activeRunId: string | null;

  setRun(run: Run | RunSummary): void;
  setActive(runId: string | null): void;
  appendEvent(event: Event): void;
  loadRuns(summaries: RunSummary[]): void;
}

export const useStore = create<RunState>((set) => ({
  runs: new Map(),
  events: new Map(),
  activeRunId: null,

  setRun(run) {
    set((state) => {
      const next = new Map(state.runs);
      next.set(run.id, { ...next.get(run.id), ...run } as Run);
      return { runs: next };
    });
  },
  setActive(runId) {
    set({ activeRunId: runId });
  },
  appendEvent(event) {
    set((state) => {
      const next = new Map(state.events);
      const list = next.get(event.runId) ?? [];
      next.set(event.runId, [...list, event]);
      return { events: next };
    });
  },
  loadRuns(summaries) {
    set((state) => {
      const next = new Map(state.runs);
      for (const s of summaries) {
        const existing = next.get(s.id);
        if (existing) next.set(s.id, { ...existing, ...s } as Run);
        else next.set(s.id, s as Run);
      }
      return { runs: next };
    });
  },
}));
