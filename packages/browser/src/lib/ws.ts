import type { Event } from "@pi-studio/shared";

export type WsEvent = { type: "event"; payload: Event };
export type WsCommand = { type: "subscribe"; runId: string } | { type: "subscribe_all" };

export interface StudioClientOptions {
  url: string;
  onEvent: (event: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class StudioClient {
  private ws: WebSocket | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private subscriptions = new Set<string | null>();
  private closed = false;

  constructor(private opts: StudioClientOptions) {}

  connect(): void {
    this.closed = false;
    this.openSocket();
  }

  private openSocket(): void {
    this.ws = new WebSocket(this.opts.url);
    this.ws.onopen = () => {
      this.reconnectDelay = 1000;
      this.opts.onConnect?.();
      for (const sub of this.subscriptions) {
        if (!this.ws) return;
        if (sub === null) this.ws.send(JSON.stringify({ type: "subscribe_all" }));
        else this.ws.send(JSON.stringify({ type: "subscribe", runId: sub }));
      }
    };
    this.ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data) as WsEvent;
        if (data.type === "event") this.opts.onEvent(data.payload);
      } catch (e) {
        console.error("bad WS message:", e);
      }
    };
    this.ws.onclose = () => {
      this.opts.onDisconnect?.();
      if (this.closed) return;
      setTimeout(() => this.openSocket(), this.reconnectDelay);
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    };
    this.ws.onerror = (e) => console.error("WS error:", e);
  }

  subscribe(runId: string): void {
    this.subscriptions.add(runId);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "subscribe", runId }));
    }
  }

  subscribeAll(): void {
    this.subscriptions.add(null);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "subscribe_all" }));
    }
  }

  close(): void {
    this.closed = true;
    this.ws?.close();
  }
}
