"use client";
import { useStore } from "@/lib/store";

export function ApprovalModal() {
  const activeRunId = useStore((s) => s.activeRunId);
  const events = useStore((s) => (activeRunId ? s.events.get(activeRunId) ?? [] : []));
  const lastApproval = [...events].reverse().find((e) => e.type === "approval_required");
  if (!lastApproval || lastApproval.type !== "approval_required") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          width: 460,
          background: "rgba(15, 15, 22, 0.95)",
          border: "1px solid var(--border-medium)",
          borderRadius: 14,
          boxShadow: "0 25px 70px rgba(0,0,0,0.7)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-jetbrains)",
              fontSize: 10,
              color: "var(--accent-amber)",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent-amber)",
                boxShadow: "0 0 8px var(--accent-amber)",
              }}
            />
            Approval needed · {lastApproval.agent}
          </div>
          <h3 style={{ fontFamily: "var(--font-fraunces)", fontSize: 20, fontWeight: 400, lineHeight: 1.2, margin: 0 }}>
            {lastApproval.tool}
          </h3>
        </div>
        <div style={{ padding: "16px 22px" }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: 9,
              color: "var(--text-tertiary)",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Proposed change
          </div>
          <pre
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              fontFamily: "var(--font-jetbrains)",
              fontSize: 11,
              lineHeight: 1.6,
              padding: 12,
              color: "var(--text-secondary)",
              maxHeight: 200,
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {lastApproval.diff}
          </pre>
        </div>
        <div style={{ padding: "14px 22px 20px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            style={{
              padding: "9px 16px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              border: "1px solid var(--border-medium)",
              background: "rgba(248, 113, 113, 0.1)",
              color: "var(--accent-coral)",
              fontFamily: "inherit",
            }}
          >
            ✕ Reject
          </button>
          <button
            style={{
              padding: "9px 16px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              border: "1px solid var(--border-medium)",
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              fontFamily: "inherit",
            }}
          >
            ✎ Edit
          </button>
          <button
            style={{
              padding: "9px 16px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              border: "none",
              background: "linear-gradient(135deg, var(--accent-green), #22d3ee)",
              color: "#000",
              boxShadow: "0 0 20px rgba(74, 222, 128, 0.3)",
              fontFamily: "inherit",
            }}
          >
            ✓ Approve
          </button>
        </div>
      </div>
    </div>
  );
}
