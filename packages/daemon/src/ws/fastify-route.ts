import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import { WebSocketHub, type HubOptions } from "./hub.js";

export interface RegisterWsOptions extends HubOptions {}

/**
 * Register a /ws route on a Fastify instance that bridges incoming
 * WebSocket connections to the EventBus via WebSocketHub.
 */
export async function registerWebSocketRoute(
  app: FastifyInstance,
  opts: RegisterWsOptions,
): Promise<void> {
  const hub = new WebSocketHub(opts);

  app.get("/ws", { websocket: true }, (connection) => {
    // @fastify/websocket v11+ passes a SocketStream object
    // The actual ws WebSocket lives at connection.socket
    const socket = (connection as unknown as { socket: WebSocket }).socket;
    hub.handleConnection(socket);
  });

  app.addHook("onClose", async () => {
    hub.close();
  });
}
