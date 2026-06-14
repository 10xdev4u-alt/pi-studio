// Shared type definitions for Pi Studio
// Used by both the daemon (server) and the browser (client)

export type Event =
  | { type: "session_start"; runId: string; task: string; agents: string[]; cwd?: string }
  | { type: "session_end"; runId: string; status: "done" | "failed" | "cancelled"; error?: string }
  | { type: "agent_start"; runId: string; agent: string; model?: string }
  | { type: "agent_end"; runId: string; agent: string; status: "done" | "failed" }
  | { type: "message"; runId: string; agent: string; role: "user" | "assistant"; content: string }
  | { type: "tool_call"; runId: string; agent: string; tool: string; args: Record<string, unknown>; requireApproval: boolean }
  | { type: "tool_result"; runId: string; agent: string; tool: string; result: string; isError?: boolean }
  | { type: "thinking"; runId: string; agent: string; text: string }
  | { type: "usage"; runId: string; agent: string; input: number; output: number; cost: number }
  | { type: "approval_required"; runId: string; agent: string; tool: string; diff: string }
  | { type: "approval_decided"; runId: string; decision: "approve" | "reject" | "edit"; editedArgs?: Record<string, unknown> };

export function isEvent(value: unknown): value is Event {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as { type: unknown }).type === "string" &&
    "runId" in value
  );
}
