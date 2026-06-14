"use client";
import { useEvents } from "@/lib/store";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export function MetricsDashboard({ runId }: { runId: string }) {
  const events = useEvents(runId);
  const totalIn = events
    .filter((e) => e.type === "usage")
    .reduce((sum, e) => sum + (e.type === "usage" ? e.input : 0), 0);
  const totalOut = events
    .filter((e) => e.type === "usage")
    .reduce((sum, e) => sum + (e.type === "usage" ? e.output : 0), 0);
  const totalCost = events
    .filter((e) => e.type === "usage")
    .reduce((sum, e) => sum + (e.type === "usage" ? e.cost : 0), 0);

  const firstEvent = events[0] as { timestamp?: number } | undefined;
  const startTime = firstEvent?.timestamp ?? Date.now();
  const elapsed = Math.floor((Date.now() - startTime) / 1000);

  const usageHistory = events
    .filter((e) => e.type === "usage")
    .map((e, i) => ({ i, value: e.type === "usage" ? e.input + e.output : 0 }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
      <Metric label="↑ Input" value={formatNumber(totalIn)} sub="tokens" data={usageHistory} color="var(--accent-indigo)" />
      <Metric label="↓ Output" value={formatNumber(totalOut)} sub="tokens" data={usageHistory} color="var(--accent-purple)" />
      <Metric
        label="$ Cost"
        value={`$${totalCost.toFixed(3)}`}
        sub="this run"
        data={usageHistory}
        color="var(--accent-pink)"
        gradient
      />
      <Metric label="⏱ Elapsed" value={`${elapsed}s`} sub="running" data={usageHistory} color="var(--accent-cyan)" />
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  data,
  color,
  gradient,
}: {
  label: string;
  value: string;
  sub: string;
  data: { i: number; value: number }[];
  color: string;
  gradient?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains)",
          fontSize: 9,
          color: "var(--text-tertiary)",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 500,
          background: gradient ? "var(--gradient-accent)" : undefined,
          WebkitBackgroundClip: gradient ? "text" : undefined,
          WebkitTextFillColor: gradient ? "transparent" : undefined,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div style={{ height: 16, marginTop: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis hide domain={[0, "auto"]} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontFamily: "var(--font-jetbrains)", fontSize: 9, color: "var(--text-tertiary)" }}>{sub}</div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}
