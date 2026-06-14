"use client";
import { getAgentConfig } from "@/lib/agents";

export function AgentAvatar({ name, thinking, size = 22 }: { name: string; thinking?: boolean; size?: number }) {
  const cfg = getAgentConfig(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 5,
        background: cfg.color,
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: 600,
        fontFamily: "var(--font-jetbrains)",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {cfg.symbol}
      {thinking && (
        <div
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 7,
            border: `1px solid ${cfg.color}`,
            opacity: 0.6,
            animation: "pulse-halo 1.6s ease-out infinite",
          }}
        />
      )}
    </div>
  );
}
