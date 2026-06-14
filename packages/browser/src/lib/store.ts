import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
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
      const list = next.get(event.runId);
      next.set(event.runId, list ? [...list, event] : [event]);
      return { events: next };
    });
  },
  loadRuns(summaries) {
    set((state) => {
      const next = new Map(state.runs);
      for (const s of summaries) {
        const existing = next.get(s.id);
        if (existing) next.set(s.id, { ...existing, ...s } as Run);
        else next.set(s.id, { ...s, totalInput: 0, totalOutput: 0, totalCost: 0 } as Run);
      }
      return { runs: next };
    });
  },
}));

// Stable empty array reference for selectors (prevents infinite loop with useSyncExternalStore)
export const EMPTY_EVENTS: readonly Event[] = Object.freeze([]) as readonly Event[];

/**
 * Hook to get the events array for a given runId.
 * Returns a stable reference (EMPTY_EVENTS) when no events exist,
 * so React's useSyncExternalStore doesn't infinite-loop.
 */
export function useEvents(runId: string | null): readonly Event[] {
  return useStore(
    useShallow((s) => {
      if (!runId) return EMPTY_EVENTS;
      return s.events.get(runId) ?? EMPTY_EVENTS;
    }),
  );
}

export function useRun(runId: string | null): Run | undefined {
  return useStore((s) => (runId ? s.runs.get(runId) : undefined));
}

export function useActiveRunId(): string | null {
  return useStore((s) => s.activeRunId);
}
