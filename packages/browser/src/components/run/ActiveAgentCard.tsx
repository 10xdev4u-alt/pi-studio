"use client";
import { useStore } from "@/lib/store";
import { AgentAvatar } from "./AgentAvatar";

export function ActiveAgentCard({ runId }: { runId: string }) {
  const events = useStore((s) => s.events.get(runId) ?? []);
  const lastThinking = [...events].reverse().find((e) => e.type === "thinking");
  const lastTool = [...events].reverse().find((e) => e.type === "tool_call");

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(129, 140, 248, 0.04), rgba(192, 132, 252, 0.02))",
        border: "1px solid var(--border-medium)",
        borderRadius: 10,
        padding: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--accent-indigo), var(--accent-purple), transparent)",
        }}
      />
      {lastThinking && lastThinking.type === "thinking" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <AgentAvatar name={lastThinking.agent} thinking size={26} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{lastThinking.agent}</div>
              <div
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: 10,
                  color: "var(--text-tertiary)",
                }}
              >
                reasoning
              </div>
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: 12,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {lastThinking.text}
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 13,
                background: "var(--accent-purple)",
                marginLeft: 2,
                verticalAlign: "text-bottom",
                animation: "blink 1s steps(2) infinite",
              }}
            />
          </div>
        </>
      )}
      {lastTool && lastTool.type === "tool_call" && (
        <div
          style={{
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 5,
            fontFamily: "var(--font-jetbrains)",
            fontSize: 10,
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "var(--accent-cyan)",
              boxShadow: "0 0 6px var(--accent-cyan)",
            }}
          />
          {lastTool.tool}: {JSON.stringify(lastTool.args).slice(0, 60)}
        </div>
      )}
    </div>
  );
}
