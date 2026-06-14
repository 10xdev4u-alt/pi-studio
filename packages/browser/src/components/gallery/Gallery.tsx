"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudioApi } from "@/lib/api";
import type { RunSummary } from "@pi-studio/shared";

const api = new StudioApi("");

const STATUS_COLOR: Record<string, string> = {
  running: "var(--accent-amber)",
  done: "var(--accent-green)",
  failed: "var(--accent-coral)",
  cancelled: "var(--text-tertiary)",
};

export function Gallery() {
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [filter, setFilter] = useState<"all" | "running" | "done" | "failed" | "cancelled">("all");

  useEffect(() => {
    api.listRuns().then(setRuns).catch((err) => {
      console.error("failed to load runs:", err);
      setRuns([]);
    });
  }, []);

  if (!runs) {
    return (
      <div style={{ padding: 32, color: "var(--text-tertiary)" }}>
        Loading runs…
      </div>
    );
  }

  const filtered = filter === "all" ? runs : runs.filter((r) => r.status === filter);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ fontFamily: "var(--font-fraunces)", fontSize: 28, fontWeight: 400, letterSpacing: -0.5 }}>
          Past runs
        </h2>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "running", "done", "failed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: 10,
                color: filter === f ? "var(--accent-purple)" : "var(--text-tertiary)",
                background:
                  filter === f ? "linear-gradient(135deg, rgba(129,140,248,0.15), rgba(192,132,252,0.15))" : "var(--bg-elevated)",
                border: filter === f ? "1px solid rgba(192, 132, 252, 0.3)" : "1px solid var(--border-subtle)",
                padding: "5px 11px",
                borderRadius: 12,
                letterSpacing: 0.5,
                cursor: "pointer",
              }}
            >
              {f} · {filter === f ? filtered.length : runs.filter((r) => f === "all" || r.status === f).length}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 64,
            color: "var(--text-tertiary)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
          }}
        >
          <div style={{ fontFamily: "var(--font-fraunces)", fontSize: 20, color: "var(--text-secondary)", marginBottom: 8 }}>
            No runs yet
          </div>
          <div style={{ fontSize: 13 }}>Your first one is one click away.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {filtered.map((run) => (
            <Link
              key={run.id}
              href={`/runs/${run.id}`}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 10,
                padding: 16,
                position: "relative",
                overflow: "hidden",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: STATUS_COLOR[run.status] ?? "var(--text-tertiary)",
                  boxShadow: run.status === "running" ? `0 0 8px ${STATUS_COLOR[run.status]}` : "none",
                }}
              />
              <div style={{ fontFamily: "var(--font-geist)", fontSize: 14, fontWeight: 500, marginBottom: 6, paddingRight: 16 }}>
                {run.task || "(untitled run)"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 12, lineHeight: 1.4 }}>
                {run.id.slice(0, 8)} · {new Date(run.startedAt).toLocaleString()}
              </div>
              <div style={{ display: "flex", gap: 12, fontFamily: "var(--font-jetbrains)", fontSize: 9, color: "var(--text-tertiary)" }}>
                <span>⏱ {(run.duration / 1000).toFixed(1)}s</span>
                <span>$ {run.cost.toFixed(3)}</span>
                <span>{run.agentCount} agents</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
