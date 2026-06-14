"use client";
import { useEffect } from "react";
import { StudioClient } from "@/lib/ws";
import { useStore } from "@/lib/store";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  (typeof window !== "undefined" ? `ws://${window.location.hostname}:7331/ws` : "ws://localhost:7331/ws");

export function EventBridge() {
  const appendEvent = useStore((s) => s.appendEvent);
  const setRun = useStore((s) => s.setRun);

  useEffect(() => {
    const client = new StudioClient({
      url: WS_URL,
      onEvent: (event) => {
        appendEvent(event);
        if (event.type === "session_end") {
          setRun({
            id: event.runId,
            task: "",
            status: event.status,
            startedAt: Date.now(),
            totalInput: 0,
            totalOutput: 0,
            totalCost: 0,
            agentCount: 0,
          });
        }
      },
    });
    client.connect();
    client.subscribeAll();
    return () => client.close();
  }, [appendEvent, setRun]);

  return null;
}
