"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { StudioApi } from "@/lib/api";

const api = new StudioApi("");

export function NewRunButton() {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState("");
  const [provider, setProvider] = useState("anthropic");
  const setRun = useStore((s) => s.setRun);
  const setActive = useStore((s) => s.setActive);

  const handleStart = async () => {
    if (!task.trim()) return;
    try {
      const run = await api.startRun(task, { provider });
      setRun(run);
      setActive(run.id);
      setTask("");
      setOpen(false);
    } catch (err) {
      console.error("failed to start run:", err);
      alert(`Failed to start run: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "var(--gradient-accent)",
          color: "white",
          border: "none",
          borderRadius: 7,
          padding: "9px 16px",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(192, 132, 252, 0.3)",
          fontFamily: "inherit",
        }}
      >
        ▶ New run
      </button>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border-medium)",
              borderRadius: 12,
              padding: 24,
              width: 500,
              boxShadow: "0 25px 70px rgba(0,0,0,0.7)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: 22,
                fontWeight: 400,
                marginBottom: 4,
              }}
            >
              New run
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 16 }}>
              What should the agents do?
            </p>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. refactor the auth flow to use JWTs instead of sessions"
              style={{
                width: "100%",
                minHeight: 100,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: 12,
                color: "var(--text-primary)",
                fontSize: 13,
                fontFamily: "var(--font-jetbrains)",
                resize: "vertical",
                outline: "none",
              }}
              autoFocus
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
              <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-jetbrains)" }}>
                provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  color: "var(--text-primary)",
                  fontSize: 11,
                  fontFamily: "var(--font-jetbrains)",
                  outline: "none",
                }}
              >
                <option value="anthropic">anthropic</option>
                <option value="openai">openai</option>
                <option value="ollama">ollama</option>
                <option value="google">google</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "9px 16px",
                  background: "transparent",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  borderRadius: 7,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                style={{
                  padding: "9px 16px",
                  background: "var(--gradient-accent)",
                  color: "white",
                  border: "none",
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 0 20px rgba(192, 132, 252, 0.3)",
                }}
              >
                Start run
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
