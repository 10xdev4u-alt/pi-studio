"use client";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { BottomBar } from "./BottomBar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr 320px",
        gridTemplateRows: "1fr 60px",
        height: "100vh",
        background: "var(--bg-base)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 800px 400px at 20% 0%, rgba(129, 140, 248, 0.12) 0%, transparent 50%), radial-gradient(ellipse 600px 600px at 100% 30%, rgba(192, 132, 252, 0.08) 0%, transparent 50%), radial-gradient(ellipse 700px 500px at 50% 100%, rgba(240, 171, 252, 0.05) 0%, transparent 50%)",
          pointerEvents: "none",
          animation: "mesh-shift 20s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <aside
        style={{
          gridColumn: "1",
          gridRow: "1 / 3",
          borderRight: "1px solid var(--border-subtle)",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          background: "rgba(8, 8, 13, 0.4)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Sidebar />
      </aside>
      <main style={{ gridColumn: "2", gridRow: "1", overflow: "auto", position: "relative", zIndex: 1 }}>
        {children}
      </main>
      <aside
        style={{
          gridColumn: "3",
          gridRow: "1 / 3",
          borderLeft: "1px solid var(--border-subtle)",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          background: "rgba(8, 8, 13, 0.4)",
          backdropFilter: "blur(20px)",
        }}
      >
        <RightPanel />
      </aside>
      <footer
        style={{
          gridColumn: "2",
          gridRow: "2",
          borderTop: "1px solid var(--border-subtle)",
          position: "relative",
          zIndex: 1,
          background: "rgba(8, 8, 13, 0.6)",
          backdropFilter: "blur(20px)",
        }}
      >
        <BottomBar />
      </footer>
    </div>
  );
}
