// Agent personality config for Pi Studio
export interface AgentConfig {
  name: string;
  symbol: string;
  color: string;
}

export const AGENT_CONFIGS: Record<string, AgentConfig> = {
  scout: { name: "scout", symbol: "⚡", color: "#4ade80" },
  planner: { name: "planner", symbol: "◇", color: "#67e8f9" },
  worker: { name: "worker", symbol: "▣", color: "#f0abfc" },
  reviewer: { name: "reviewer", symbol: "✓", color: "#fb7185" },
  tester: { name: "tester", symbol: "▷", color: "#fbbf24" },
  default: { name: "agent", symbol: "·", color: "#94a3b8" },
};

export function getAgentConfig(name: string): AgentConfig {
  return AGENT_CONFIGS[name] ?? AGENT_CONFIGS["default"]!;
}
