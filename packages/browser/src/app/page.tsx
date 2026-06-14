import { Shell } from "@/components/layout/Shell";
import { EventBridge } from "@/components/EventBridge";
import { ActiveAgentCard } from "@/components/run/ActiveAgentCard";
import { MetricsDashboard } from "@/components/run/MetricsDashboard";
import { useStore } from "@/lib/store";

function LiveRun() {
  const activeRunId = useStore((s) => s.activeRunId);
  const run = useStore((s) => (activeRunId ? s.runs.get(activeRunId) : null));
  if (!activeRunId || !run) {
    return (
      <div style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <h2
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: 32,
              fontWeight: 400,
              background: "var(--gradient-accent)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 12,
            }}
          >
            Welcome to π Studio
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
            Press <kbd style={{ background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: 4, fontFamily: "var(--font-jetbrains)", fontSize: 11 }}>▶ New run</kbd>{" "}
            to start a multi-agent session, or browse your past runs.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h2
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: -0.5,
            lineHeight: 1.1,
          }}
        >
          {run.task || "Active run"}
        </h2>
        <div
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: 10,
            color: "var(--text-tertiary)",
            marginTop: 6,
            letterSpacing: 0.5,
          }}
        >
          {activeRunId.slice(0, 8)} · {run.status}
        </div>
      </div>
      <ActiveAgentCard runId={activeRunId} />
      <MetricsDashboard runId={activeRunId} />
    </div>
  );
}

export default function Home() {
  return (
    <Shell>
      <EventBridge />
      <LiveRun />
    </Shell>
  );
}
