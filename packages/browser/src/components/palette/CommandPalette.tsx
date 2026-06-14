"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudioApi } from "@/lib/api";

const api = new StudioApi("");

interface PaletteItem {
  id: string;
  icon: string;
  iconClass: string;
  title: string;
  sub: string;
  kbd?: string;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  if (!open) return null;

  const items: PaletteItem[] = [
    {
      id: "new-run",
      icon: "▶",
      iconClass: "commands",
      title: "New run",
      sub: "Start a new multi-agent session",
      kbd: "⌘N",
      action: () => {
        setOpen(false);
        // Trigger NewRunButton via custom event
        window.dispatchEvent(new CustomEvent("pi-studio:new-run"));
      },
    },
    {
      id: "gallery",
      icon: "▦",
      iconClass: "sessions",
      title: "Browse past runs",
      sub: "Open the gallery of completed sessions",
      action: () => {
        setOpen(false);
        router.push("/gallery");
      },
    },
    {
      id: "live",
      icon: "π",
      iconClass: "commands",
      title: "Live run view",
      sub: "Go to the active session view",
      action: () => {
        setOpen(false);
        router.push("/");
      },
    },
    ...(query.length > 0
      ? [
          {
            id: "search-runs",
            icon: "⌕",
            iconClass: "sessions" as const,
            title: `Search runs for "${query}"`,
            sub: "Find past runs matching this query",
            action: () => {
              setOpen(false);
              router.push("/gallery");
            },
          },
        ]
      : []),
  ];

  const filtered = items.filter(
    (i) => i.title.toLowerCase().includes(query.toLowerCase()) || i.sub.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 80,
        zIndex: 300,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          background: "rgba(15, 15, 22, 0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions, agents, commands…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[selected]) filtered[selected].action();
              if (e.key === "ArrowDown") setSelected((s) => Math.min(s + 1, filtered.length - 1));
              if (e.key === "ArrowUp") setSelected((s) => Math.max(s - 1, 0));
            }}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#fafafa",
              fontFamily: "var(--font-geist)",
              fontSize: 14,
              outline: "none",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: 9,
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.5)",
              padding: "2px 5px",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            ESC
          </span>
        </div>
        <div style={{ maxHeight: 320, overflow: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, color: "var(--text-tertiary)", textAlign: "center", fontSize: 13 }}>
              No matches
            </div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={item.id}
                onClick={() => item.action()}
                onMouseEnter={() => setSelected(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.75)",
                  background:
                    i === selected
                      ? "linear-gradient(90deg, rgba(192, 132, 252, 0.12), rgba(192, 132, 252, 0.04))"
                      : "transparent",
                  borderLeft: i === selected ? "2px solid var(--accent-purple)" : "2px solid transparent",
                  paddingLeft: i === selected ? 14 : 16,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    background: "rgba(192, 132, 252, 0.15)",
                    color: "var(--accent-purple)",
                    flexShrink: 0,
                    fontFamily: "var(--font-jetbrains)",
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "rgba(255,255,255,0.9)" }}>{item.title}</div>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 1,
                    }}
                  >
                    {item.sub}
                  </div>
                </div>
                {item.kbd && (
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 9,
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.5)",
                      padding: "2px 5px",
                      borderRadius: 3,
                    }}
                  >
                    {item.kbd}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: 14,
            fontFamily: "var(--font-jetbrains)",
            fontSize: 9,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              ↑↓
            </span>
            navigate
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              ↵
            </span>
            select
          </div>
        </div>
      </div>
    </div>
  );
}
