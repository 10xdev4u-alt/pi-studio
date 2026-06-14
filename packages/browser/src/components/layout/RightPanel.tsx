"use client";
import { useEvents, useActiveRunId } from "@/lib/store";
import { Constellation } from "../run/Constellation";

export function RightPanel() {
  const activeRunId = useActiveRunId();
  const events = useEvents(activeRunId);

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      {activeRunId && <Constellation runId={activeRunId} />}
      <div>
        <div
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: 9,
            color: "var(--text-tertiary)",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span>Event stream</span>
          <span style={{ color: "var(--accent-green)" }}>● live</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: "calc(100vh - 360px)", overflow: "auto" }}>
          {events.slice(-50).reverse().map((e, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                fontSize: 11,
                padding: "5px 8px",
                borderRadius: 4,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              <span style={{ color: eventTypeColor(e.type), fontWeight: 600, flexShrink: 0 }}>{eventShortType(e.type)}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eventSummary(e)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function eventTypeColor(t: string): string {
  if (t.includes("tool")) return "var(--accent-cyan)";
  if (t.includes("done") || t.includes("end")) return "var(--accent-green)";
  if (t.includes("thinking") || t.includes("approval")) return "var(--accent-amber)";
  return "var(--accent-indigo)";
}
function eventShortType(t: string): string {
  return t.split("_")[0] ?? t;
}
function eventSummary(e: { type: string; [k: string]: unknown }): string {
  if (e.type === "message" && "content" in e) return String(e.content).slice(0, 60);
  if (e.type === "tool_call" && "tool" in e) return String(e.tool);
  if (e.type === "thinking" && "text" in e) return String(e.text).slice(0, 60);
  if (e.type === "agent_start" && "agent" in e) return `${e.agent} started`;
  if (e.type === "agent_end" && "agent" in e) return `${e.agent} ${e.status}`;
  return e.type;
}
