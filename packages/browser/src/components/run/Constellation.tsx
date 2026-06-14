"use client";
import { ReactFlow, Background } from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/lib/store";
import { getAgentConfig } from "@/lib/agents";

export function Constellation({ runId }: { runId: string }) {
  const events = useStore((s) => s.events.get(runId) ?? []);
  const agents = new Set<string>();
  for (const e of events) {
    if ("agent" in e && typeof e.agent === "string") agents.add(e.agent);
  }
  const agentList = Array.from(agents);

  const nodes = [
    {
      id: "center",
      position: { x: 150, y: 50 },
      data: { label: "π" },
      type: "default",
      style: {
        background: "var(--accent-indigo)",
        color: "white",
        width: 50,
        height: 50,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontFamily: "var(--font-fraunces)",
        border: "1px solid rgba(255,255,255,0.2)",
      },
    },
    ...agentList.map((a, i) => {
      const angle = (i / Math.max(agentList.length, 1)) * Math.PI * 2;
      const x = 150 + Math.cos(angle) * 110;
      const y = 75 + Math.sin(angle) * 50;
      const cfg = getAgentConfig(a);
      const isActive = events.some((e) => e.type === "agent_start" && e.agent === a) &&
        !events.some((e) => e.type === "agent_end" && e.agent === a);
      return {
        id: a,
        position: { x, y },
        data: { label: cfg.symbol },
        type: "default",
        style: {
          background: cfg.color,
          color: "black",
          width: 26,
          height: 26,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          opacity: isActive ? 1 : 0.4,
          border: "1px solid rgba(0,0,0,0.2)",
        },
      };
    }),
  ];
  const edges = agentList.map((a) => ({
    id: `center-${a}`,
    source: "center",
    target: a,
    style: { stroke: "rgba(255,255,255,0.08)", strokeWidth: 0.5 },
  }));

  return (
    <div style={{ height: 160, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 8, position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.05)" gap={20} />
      </ReactFlow>
    </div>
  );
}
