import { WebSocketServer, type WebSocket } from "ws";
import type { EventBus } from "../sessions/event-bus.js";

interface Client {
  socket: WebSocket;
  unsubscribe: () => void;
}

export interface HubOptions {
  bus: EventBus;
  port: number;
  host: string;
}

export class WebSocketHub {
  private wss: WebSocketServer | null = null;
  private clients = new Set<Client>();

  constructor(private opts: HubOptions) {}

  start(): Promise<number> {
    return new Promise((resolve) => {
      this.wss = new WebSocketServer({ port: this.opts.port, host: this.opts.host });
      this.wss.on("connection", (socket) => this.onConnection(socket));
      this.wss.on("listening", () => {
        const addr = this.wss!.address();
        const port = typeof addr === "object" && addr ? addr.port : this.opts.port;
        resolve(port);
      });
    });
  }

  handleConnection(socket: WebSocket): void {
    this.onConnection(socket);
  }

  private onConnection(socket: WebSocket): void {
    const client: Client = { socket, unsubscribe: () => {} };

    socket.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString()) as { type: string; runId?: string };
        if (msg.type === "subscribe" && typeof msg.runId === "string") {
          client.unsubscribe = this.opts.bus.subscribe(msg.runId, (event) => {
            if (socket.readyState === socket.OPEN) {
              socket.send(JSON.stringify({ type: "event", payload: event }));
            }
          });
        } else if (msg.type === "subscribe_all") {
          client.unsubscribe = this.opts.bus.subscribe(null, (event) => {
            if (socket.readyState === socket.OPEN) {
              socket.send(JSON.stringify({ type: "event", payload: event }));
            }
          });
        }
      } catch (e) {
        console.error("bad message from client:", e);
      }
    });

    socket.on("close", () => {
      client.unsubscribe();
      this.clients.delete(client);
    });

    this.clients.add(client);
  }

  close(): void {
    for (const client of this.clients) {
      client.unsubscribe();
      client.socket.close();
    }
    this.clients.clear();
    this.wss?.close();
    this.wss = null;
  }
}
