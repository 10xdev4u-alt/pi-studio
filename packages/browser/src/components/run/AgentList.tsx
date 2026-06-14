"use client";
import { useEvents, useStore } from "@/lib/store";
import { AgentAvatar } from "./AgentAvatar";

export function AgentList({ runId }: { runId: string }) {
  const events = useEvents(runId);
  const activeRun = useStore((s) => s.runs.get(runId));

  const agents = new Map<string, { name: string; status: "queued" | "running" | "done" | "failed" }>();
  for (const e of events) {
    if (e.type === "agent_start") agents.set(e.agent, { name: e.agent, status: "running" });
    if (e.type === "agent_end") {
      const a = agents.get(e.agent);
      if (a) a.status = e.status;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontFamily: "var(--font-jetbrains)",
          fontSize: 9,
          color: "var(--text-tertiary)",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          padding: "8px 8px 6px",
        }}
      >
        {activeRun?.task.slice(0, 32) ?? "This run"}
      </div>
      {Array.from(agents.values()).map((a) => (
        <div
          key={a.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 6,
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <AgentAvatar name={a.name} thinking={a.status === "running"} />
          <div style={{ fontFamily: "var(--font-jetbrains)" }}>{a.name}</div>
          <div
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-jetbrains)",
              fontSize: 9,
              color:
                a.status === "done"
                  ? "var(--accent-green)"
                  : a.status === "running"
                    ? "var(--accent-amber)"
                    : "var(--text-tertiary)",
            }}
          >
            {a.status}
          </div>
        </div>
      ))}
    </div>
  );
}
