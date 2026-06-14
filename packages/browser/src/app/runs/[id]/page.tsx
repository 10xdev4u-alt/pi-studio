"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStore, useEvents } from "@/lib/store";
import { StudioApi } from "@/lib/api";
import { EventBridge } from "@/components/EventBridge";
import { AgentList } from "@/components/run/AgentList";
import { ActiveAgentCard } from "@/components/run/ActiveAgentCard";
import { MetricsDashboard } from "@/components/run/MetricsDashboard";
import { Constellation } from "@/components/run/Constellation";

const api = new StudioApi("");

export default function RunDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const setRun = useStore((s) => s.setRun);
  const setActive = useStore((s) => s.setActive);
  const events = useEvents(id);
  const [loading, setLoading] = useState(true);
  const [scrubberPos, setScrubberPos] = useState(1);

  useEffect(() => {
    setActive(id);
    api.getRun(id).then((r) => {
      setRun(r);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, setRun, setActive]);

  if (loading) {
    return (
      <div style={{ padding: 32, color: "var(--text-tertiary)" }}>
        Loading run…
      </div>
    );
  }

  const visibleEvents = events.slice(0, Math.ceil(events.length * scrubberPos));

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18, maxWidth: 1200, margin: "0 auto" }}>
      <EventBridge />
      <div style={{ fontFamily: "var(--font-jetbrains)", fontSize: 10, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
        π studio / runs / {id.slice(0, 8)}
      </div>

      {/* Timeline scrubber */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: 14 }}>
        <div style={{ position: "relative", height: 24, display: "flex", alignItems: "center", marginBottom: 10 }}>
          <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }} />
          <div style={{ position: "absolute", left: 0, width: `${scrubberPos * 100}%`, height: 2, background: "var(--gradient-accent)", borderRadius: 1 }} />
          {events.map((e, i) => {
            const x = (i / Math.max(events.length - 1, 1)) * 100;
            const color =
              e.type === "tool_call"
                ? "var(--accent-cyan)"
                : e.type === "agent_end"
                  ? "var(--accent-green)"
                  : e.type === "thinking"
                    ? "var(--accent-amber)"
                    : "var(--accent-indigo)";
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: e.type === "agent_end" ? `0 0 6px ${color}` : "none",
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${scrubberPos * 100}%`,
              transform: "translate(-50%, -50%)",
              width: 12,
              height: 12,
              background: "#fff",
              borderRadius: "50%",
              boxShadow: "0 0 0 3px rgba(192, 132, 252, 0.3), 0 2px 8px rgba(0,0,0,0.4)",
            }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={scrubberPos}
          onChange={(e) => setScrubberPos(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent-purple)" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 10, color: "var(--text-tertiary)" }}>
            {visibleEvents.length} / {events.length} events
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <ActiveAgentCard runId={id} />
        </div>
        <div>
          <Constellation runId={id} />
        </div>
      </div>

      <MetricsDashboard runId={id} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Agent list
          </div>
          <AgentList runId={id} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-jetbrains)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Timeline ({visibleEvents.length} events shown)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 400, overflow: "auto" }}>
            {visibleEvents.map((e, i) => (
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
                  background: "var(--bg-elevated)",
                }}
              >
                <span style={{ color: "var(--accent-indigo)", fontWeight: 600, flexShrink: 0 }}>{e.type.split("_")[0]}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {("text" in e ? e.text : "content" in e ? e.content : "tool" in e ? e.tool : e.type)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
