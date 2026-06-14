import type { Event } from "@pi-studio/shared";

type Subscriber = (event: Event) => void;

export class EventBus {
  private subscribers = new Map<string, Set<Subscriber>>();

  subscribe(runId: string | null, handler: Subscriber): () => void {
    const key = runId ?? "*";
    let set = this.subscribers.get(key);
    if (!set) {
      set = new Set();
      this.subscribers.set(key, set);
    }
    set.add(handler);
    return () => {
      set?.delete(handler);
    };
  }

  publish(event: Event): void {
    const all = this.subscribers.get("*");
    if (all) {
      for (const sub of all) {
        try {
          sub(event);
        } catch (e) {
          console.error("subscriber error:", e);
        }
      }
    }
    const specific = this.subscribers.get(event.runId);
    if (specific) {
      for (const sub of specific) {
        try {
          sub(event);
        } catch (e) {
          console.error("subscriber error:", e);
        }
      }
    }
  }
}
