"use client";
import { NewRunButton } from "../NewRunButton";

export function BottomBar() {
  return (
    <div style={{ padding: 12, display: "flex", gap: 10, alignItems: "center", height: "100%" }}>
      <div
        style={{
          flex: 1,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 13,
          color: "var(--text-tertiary)",
          fontFamily: "var(--font-jetbrains)",
        }}
      >
        π <span style={{ marginLeft: 4, opacity: 0.6 }}>Send a message, approve, or interrupt…</span>
      </div>
      <NewRunButton />
    </div>
  );
}
