"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AgentList } from "../run/AgentList";

export function Sidebar() {
  const activeRunId = useStore((s) => s.activeRunId);
  return (
    <nav style={{ padding: 16, display: "flex", flexDirection: "column", height: "100%" }}>
      <h1
        style={{
          fontFamily: "var(--font-fraunces)",
          fontSize: 20,
          fontWeight: 400,
          background: "var(--gradient-accent)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        π Studio
      </h1>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 4 }}>
        <Link href="/" style={{ padding: 8, color: "var(--text-secondary)", textDecoration: "none", fontSize: 13 }}>
          Live run
        </Link>
        <Link href="/gallery" style={{ padding: 8, color: "var(--text-secondary)", textDecoration: "none", fontSize: 13 }}>
          Past runs
        </Link>
      </div>
      {activeRunId && (
        <div style={{ marginTop: 24, flex: 1, overflow: "auto" }}>
          <AgentList runId={activeRunId} />
        </div>
      )}
    </nav>
  );
}
