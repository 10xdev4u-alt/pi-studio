# Pi Studio — Design Spec

**Date:** 2026-06-14
**Status:** Approved for implementation
**Author:** Princyy + Lead Architect
**Scope:** v0.1.0 — C1 (Production-Grade Self-Hostable MVP)

---

## 1. Overview

### 1.1 Problem

[Pi](https://github.com/earendil-works/pi-coding-agent) is a fast, TUI-native AI coding harness with a powerful multi-agent subagent extension (scout, planner, worker, reviewer, best-of-n, codebuff-loop, etc.). But:

- **Terminal-bound:** Non-technical users can't benefit. Mobile users can't either.
- **Invisible process:** You see text scroll by, but the *structure* of a multi-agent run is hidden.
- **No replay or sharing:** Past runs vanish into session files. No way to share, review, or learn from them.
- **Approvals interrupt flow:** A TUI prompt is the only place to approve a tool call.

### 1.2 Solution

**Pi Studio** is a browser-based front-end for pi. It:

1. **Spawns real `pi` subprocesses** in the background and streams their activity to a browser.
2. **Visualizes the multi-agent mesh** in real time — each agent is a distinct entity with a personality, color, and thinking state.
3. **Lets you approve, reject, or modify** proposed changes from a beautiful modal — with the diff right there.
4. **Records every run** to a persistent session library you can replay, search, and share.
5. **Self-hosts in one command** — `npx pi-studio` or `docker run`, that's it.

### 1.3 Non-Goals (v0.1.0)

To ship something real, we explicitly exclude:

- ❌ Multi-user accounts / teams / orgs
- ❌ Cloud hosting / billing
- ❌ Public session gallery
- ❌ Mobile native apps (the web app is mobile-responsive, but no native)
- ❌ Editing pi itself (Pi Studio is a *companion*, not a fork)

These are C2 / C3 follow-ups.

---

## 2. Scope: C1 — Production-Grade Self-Hostable MVP

**The rule:** real, working, deployable today. No mock data. No "coming soon" screens. No "you'll need to wire this up yourself" disclaimers.

**The test:** a developer can `git clone`, run one install command, and have a working Pi Studio instance streaming real pi runs in under 5 minutes.

---

## 3. Architecture

### 3.1 High-Level Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (Next.js 15)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Live Run │ │  Replay  │ │  Gallery │ │ Command  │  ...    │
│  │   View   │ │   View   │ │   View   │ │ Palette  │         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
│       │            │            │            │               │
│       └────────────┴─────┬──────┴────────────┘               │
│                          │ WebSocket (binary + JSON)         │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    pi-studio daemon                          │
│   ┌─────────────────┐   │   ┌─────────────────┐              │
│   │  HTTP server    │◄──┼──►│ WebSocket hub   │              │
│   │  (REST API)     │   │   │  (event bus)    │              │
│   └────────┬────────┘   │   └────────┬────────┘              │
│            │            │            │                       │
│   ┌────────▼────────┐   │   ┌────────▼────────┐              │
│   │  Session store  │   │   │  File tailer    │              │
│   │  (SQLite)       │   │   │  (chokidar)     │              │
│   └─────────────────┘   │   └────────┬────────┘              │
│                         │            │                       │
│                         │   ┌────────▼────────┐              │
│                         │   │  pi subprocess  │              │
│                         │   │  (--mode json)  │              │
│                         │   └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                          ~/.pi/agent/sessions/.../*.jsonl
```

### 3.2 Components

#### A. **Browser** (Next.js 15, App Router, React 19, TypeScript)

The visual layer. Pure consumer of events from the daemon. Renders 4 main views:

| View | Purpose |
|---|---|
| **Live Run** | Real-time multi-agent activity for the currently-running session |
| **Session Detail / Replay** | Scrubbable timeline of any past session |
| **Past Runs Gallery** | Grid of all sessions with filters, search, and status |
| **Command Palette (⌘K)** | Global launcher: jump to sessions, spawn agents, run commands |

Plus persistent chrome: left sidebar (agent list + past runs), right panel (event stream + constellation mini-map), bottom command bar.

#### B. **Daemon** (Node.js 22, TypeScript, Fastify, ws)

The orchestration layer. Owns the pi subprocess lifecycle and the event bus.

Responsibilities:
- Spawn `pi` subprocesses with `--mode json --session-id <uuid> --print` flags
- Tail the JSONL session file with [chokidar](https://github.com/paulmillr/chokidar) (low latency, robust to crashes)
- Stream stdout JSON events in parallel (sub-100ms real-time)
- Bridge both streams into a unified event sequence
- Broadcast events to all connected WebSocket clients
- Persist session metadata + summary stats to SQLite
- Serve the Next.js static build
- Handle auth (single-user, password + bcrypt) for the self-hosted case

#### C. **pi subprocess** (the existing pi binary, unmodified)

We do not modify pi. We use its existing CLI flags:
- `--mode json` — JSON output on stdout
- `--print` / `-p` — non-interactive mode
- `--session-id <uuid>` — use a specific session ID
- `--session-dir <dir>` — custom session dir
- `--no-session` — for ephemeral runs (not used in v0.1.0)
- `--approve` — auto-approve project files

The session JSONL file is pi's source of truth. The daemon is a thin bridge.

#### D. **Storage**

- **SQLite** (via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)) for session metadata, run summaries, user settings
- **JSONL files** in pi's native session dir for raw event logs (no duplication)
- **WebSocket** for live event streaming (no polling)

### 3.3 Data Flow

**Starting a run:**
1. User clicks "New run" → browser sends `POST /api/runs` with task description
2. Daemon generates a session UUID, spawns `pi --mode json --session-id <uuid> --print <task>`
3. Daemon returns the session ID + WebSocket channel name
4. Browser opens WebSocket, receives the historical events (replay from file), then live events

**During a run:**
1. pi writes events to `~/.pi/agent/sessions/.../session.jsonl` AND emits JSON to stdout
2. File tailer picks up new lines within 50-200ms
3. Stdout reader picks up new JSON objects within 10-50ms
4. Both feeds merge into a single event stream
5. Daemon broadcasts each event to subscribed WebSocket clients
6. Browser renders the event in the appropriate component (agent card, event stream, constellation, etc.)

**For approvals:**
1. pi sends a `tool_call` event with `requireApproval: true`
2. Daemon forwards the event with a synthetic `approval_required: true` flag
3. Browser renders the approval modal
4. User clicks approve / reject / edit
5. Browser sends `POST /api/runs/:id/approve` with the decision
6. Daemon writes the decision to pi's stdin (pi is in `--print` mode but still accepts commands via a side channel we'll define)

**Caveat on approvals:** The exact approval mechanism in `--print` mode is a research item. If pi's `--print` doesn't accept inline approvals cleanly, we may need a thin wrapper or use `--mode rpc` for that subset of interactions. v0.1.0 will prototype both and pick the winner.

### 3.4 Process Model

- **One daemon process per host.** Multi-tenant is out of scope.
- **One pi subprocess per active run.** Sequential by default; parallel runs possible via tabs.
- **Sessions persist on disk forever** (no TTL in v0.1.0). Disk usage is bounded by the user manually pruning.

---

## 4. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Browser framework | **Next.js 15 (App Router) + React 19** | Best-in-class DX, server components for static parts, RSC for fast initial loads |
| Browser language | **TypeScript 5.6+** | Strict mode, no `any` |
| Styling | **Tailwind CSS v4** | Utility-first + design tokens via CSS variables. Pairs with [shadcn/ui](https://ui.shadcn.com/) for primitives |
| UI primitives | **Radix UI + custom** | Headless, accessible, unstyled — we own the look |
| Node graph viz | **React Flow** | Best library for the multi-agent graph + constellation mini-map |
| Charts | **Recharts** | Simple, composable, good defaults for sparklines |
| Animation | **Framer Motion** | Spring-based, the de-facto standard for premium-feel motion |
| Code highlighting | **Shiki** | Same engine as VS Code, used in pi's own export-html |
| Diff rendering | **react-diff-viewer-continued** | Side-by-side + unified, syntax-highlighted |
| Daemon framework | **Fastify** | Fast, low-overhead, good plugin ecosystem |
| WebSocket | **ws** | Standard, no framework lock-in |
| File watching | **chokidar** | Battle-tested, robust to rapid changes |
| Database | **better-sqlite3** | Synchronous, fast, simple — perfect for a single-process daemon |
| Process spawning | **node:child_process.spawn** | Built-in, no extra dep |
| Auth | **bcrypt + httpOnly cookies** | Simple, secure, single-user |
| Logging | **pino** | Structured JSON logs, fast |
| Testing (browser) | **Vitest + Testing Library** | Standard for Vite-based projects |
| Testing (daemon) | **Vitest + supertest** | Same test runner, different harness |
| E2E | **Playwright** | Multi-browser, can test against real pi runs |
| Package | **npm** (with `tsup` for daemon, `next build` for browser) | Standard, predictable |
| Distribution | **npm + Docker** | `npx pi-studio` OR `docker run 10xdev4u-alt/pi-studio` |
| CI | **GitHub Actions** | Test on PR, publish on tag |

---

## 5. Aesthetic Direction

**Linear Flux** — dark mode default, deep `#08080d` base, indigo→purple→pink gradient accents, razor-sharp typography, metrics-forward. Refined, premium, productivity-tool energy. **Not** cyberpunk, **not** generic AI-vibe.

### 5.1 Design Tokens

```css
/* Base */
--bg-base: #08080d;
--bg-elevated: rgba(255, 255, 255, 0.025);
--bg-elevated-hover: rgba(255, 255, 255, 0.04);
--border-subtle: rgba(255, 255, 255, 0.06);
--border-medium: rgba(255, 255, 255, 0.1);
--text-primary: #fafafa;
--text-secondary: rgba(255, 255, 255, 0.65);
--text-tertiary: rgba(255, 255, 255, 0.4);

/* Accent gradient */
--accent-indigo: #818cf8;
--accent-purple: #c084fc;
--accent-pink:   #f0abfc;
--gradient-accent: linear-gradient(135deg, var(--accent-indigo), var(--accent-purple));

/* Semantic */
--accent-cyan:   #67e8f9;  /* tool calls, info */
--accent-green:  #4ade80;  /* success, done */
--accent-amber:  #fbbf24;  /* thinking, warning */
--accent-rose:   #fb7185;  /* error */
--accent-coral:  #f87171;  /* failed */
```

### 5.2 Typography

Three-font system, all Google Fonts:

| Role | Font | Why |
|---|---|---|
| Display (wordmark, run titles, modal headers) | **Fraunces** (variable serif) | Editorial soul, opsz axis for fine control, NOT Inter |
| Body (UI, paragraphs) | **Geist** | Modern, clean, designed by Vercel for UI work |
| Mono (code, metrics, paths) | **JetBrains Mono** | Developer favorite, ligatures, distinct character |

### 5.3 Signature Touches

These are the "out of this world" details that elevate Pi Studio from "good" to "premium":

1. **Gradient mesh background** — slow-shifting radial gradients + grain texture overlay. macOS-Sonoma-wallpaper energy, but for a dev tool.
2. **Agent personality** — each agent (scout, planner, worker, reviewer) has a unique symbol, signature color, and *thinking halo* that pulses while working. They're entities, not text rows.
3. **Constellation mini-map** — the multi-agent fan-out visualized as planets orbiting a central `π` symbol. The active agent pulses amber. Borrowed from the "Constellation" aesthetic concept but contained as a corner element, not the whole UI.
4. **Live thinking cursor** — real-time cursor animation in the agent's reasoning, tool call pills that pulse while running, color-coded event stream.
5. **Gradient-colored cost** — the `$` metric uses a gradient text fill because it matters.
6. **Timeline scrubber** — drop a pin anywhere in a past run, replay from there. The signature moment of the Session Detail view.
7. **Custom scrollbars** — thin, elegant, fading.
8. **Command palette (⌘K)** — Raycast-tier. Backdrop blur, grouped results, gradient highlight, keyboard hints, footer shortcuts.
9. **Approval modal** — eyebrow + pulsing dot, full diff preview, three clear actions, the green one glows.
10. **Empty states with personality** — line-art illustrations, not blank screens. "No runs yet — your first one is one click away."

### 5.4 Anti-Aesthetics (things we explicitly avoid)

- ❌ Inter as the primary font (overused, generic AI-vibe)
- ❌ Purple gradients on white backgrounds
- ❌ Tailwind UI / shadcn defaults without customization
- ❌ Card-with-shadow-on-flat-gray (2018 SaaS)
- ❌ Emoji-only icon system
- ❌ Skeleton loading screens that look like skeletons (use shimmer or content-aware placeholders instead)

---

## 6. Features (v0.1.0 MVP)

### 6.1 Must-Have (P0)

1. **Live multi-agent run visualization**
   - Sidebar shows all agents in the current run with status (queued / running / done / failed)
   - Center pane shows the active agent's reasoning + tool calls
   - Right panel shows real-time event stream
   - Constellation mini-map shows the whole run as a graph

2. **Approval workflow**
   - Modal pops up when an agent calls a tool that requires approval
   - Shows the proposed change as a diff
   - Three buttons: Reject / Edit / Approve
   - Decision is sent back to the pi subprocess

3. **Session persistence + library**
   - All runs saved to SQLite + JSONL
   - Gallery view shows all past runs with status, duration, cost
   - Filter by status, date, agent
   - Click any run to open the detail view

4. **Session detail / replay**
   - Timeline scrubber with color-coded event pins
   - Click any pin to jump to that moment
   - Play/pause, speed control (1x, 2x, 4x)
   - Full event log alongside the timeline

5. **Command palette (⌘K)**
   - Global launcher accessible from anywhere
   - Search sessions, agents, commands, settings
   - Keyboard-driven power user experience

6. **Real-time metrics**
   - Tokens in/out per agent
   - Cost per run (and per agent)
   - Duration, with projection for in-progress runs
   - Sparkline charts of token usage over time

7. **Self-hostable deploy**
   - `npx pi-studio` — installs daemon + browser, opens browser to localhost
   - `docker run 10xdev4u-alt/pi-studio` — same, but containerized
   - Single-user password auth (bcrypt + httpOnly cookies)
   - Clean config via env vars or a `config.toml`

### 6.2 Nice-to-Have (P1, ship if time)

8. **Session search** — full-text search across all past session events
9. **Shareable HTML export** — export any session as a self-contained HTML file
10. **Light theme** — toggle, smooth transition
11. **Theme customization** — user-defined accent color (with a curated set of presets)
12. **Multi-tab** — run multiple pi sessions side-by-side in different tabs
13. **Cost calculator** — projected cost for a run before you start it
14. **Agent presets** — define custom agent combos (e.g. "security review" = scout + reviewer with security-focused prompts)

### 6.3 Explicitly Not in v0.1.0 (deferred to v0.2+)

- Multi-user accounts / orgs / teams
- Cloud hosting / billing
- Public session gallery / social features
- Custom agent training / fine-tuning
- Pi fork / modification

---

## 7. API Surface

### 7.1 REST (HTTP)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/login` | POST | Password login → httpOnly cookie |
| `/api/auth/logout` | POST | Clear cookie |
| `/api/auth/status` | GET | Is the current user logged in? |
| `/api/runs` | GET | List all runs (with filters) |
| `/api/runs` | POST | Start a new run (returns run ID) |
| `/api/runs/:id` | GET | Get run metadata + summary |
| `/api/runs/:id/events` | GET | Get all events for a run (paginated) |
| `/api/runs/:id/approve` | POST | Approve / reject / edit a pending tool call |
| `/api/runs/:id/cancel` | POST | Cancel an in-progress run |
| `/api/agents` | GET | List available pi agents (from pi's subagent config) |
| `/api/agents/spawn` | POST | Spawn a specific agent with a task |
| `/api/health` | GET | Liveness probe (for Docker) |

### 7.2 WebSocket (`/ws`)

- Client connects with auth cookie
- Sends `subscribe` message with `runId` (or `null` for all)
- Receives `event` messages with typed payloads
- Receives `state` messages (snapshot when subscribing)
- Sends `approve` / `reject` / `edit` messages to control the run

### 7.3 Event Types (WebSocket payload shape)

```ts
type Event =
  | { type: 'session_start', runId: string, task: string, agents: string[] }
  | { type: 'agent_start', runId: string, agent: string }
  | { type: 'agent_end', runId: string, agent: string, status: 'done' | 'failed' }
  | { type: 'message', runId: string, agent: string, role: 'user' | 'assistant', content: string }
  | { type: 'tool_call', runId: string, agent: string, tool: string, args: object, requireApproval: boolean }
  | { type: 'tool_result', runId: string, agent: string, tool: string, result: string }
  | { type: 'thinking', runId: string, agent: string, text: string }
  | { type: 'usage', runId: string, agent: string, input: number, output: number, cost: number }
  | { type: 'approval_required', runId: string, agent: string, tool: string, diff: string }
  | { type: 'approval_decided', runId: string, decision: 'approve' | 'reject' | 'edit' }
  | { type: 'session_end', runId: string, status: 'done' | 'failed' | 'cancelled' };
```

---

## 8. Error Handling

### 8.1 Daemon Crashes

- Daemon auto-restarts via `nodemon` in dev, `pm2`/`systemd` in prod, Docker restart policy in container
- Active runs are lost (pi subprocess is killed when daemon dies) but session files on disk are preserved
- On restart, daemon re-reads all session files and re-broadcasts to connected clients
- Clients show a "Reconnecting..." banner during the gap

### 8.2 pi Crashes

- Daemon detects via subprocess `exit` event
- Sends `session_end` with `status: 'failed'` and the error message
- Browser shows a clear failure state with the error + option to retry

### 8.3 File Watcher Lag

- chokidar polls every 100ms; events older than 5s are flagged in the UI
- Stdout reader is the primary low-latency feed; file tailer is the safety net + history source

### 8.4 WebSocket Disconnects

- Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- On reconnect, client requests the full event log for any active run
- Daemon replays from the last known position (uses `lastEventId`)

### 8.5 Auth Failures

- Invalid cookie → 401, browser shows login screen
- No password set (fresh install) → browser shows a "set your password" screen

### 8.6 Out of Disk

- Daemon checks free disk on startup and on every new run
- < 500MB free → warn the user
- < 100MB free → refuse to start new runs

---

## 9. Testing Strategy

### 9.1 Unit Tests (Vitest)

- **Daemon:** Session manager, event bus, SQLite layer, file tailer (with mocked fs)
- **Browser:** React components (Testing Library), hooks, utility functions
- **Shared types:** Schema validation with Zod

### 9.2 Integration Tests

- **Daemon end-to-end:** Spawn a real pi subprocess with a mock provider (or a real cheap one), verify events flow correctly
- **Browser + daemon:** Spin up both, simulate a full run, verify UI updates

### 9.3 E2E Tests (Playwright)

- **Happy path:** Open the app, click "New run", see the live visualization, watch it complete
- **Approval flow:** Trigger an approval-required tool, verify modal appears, click approve, verify it goes through
- **Replay:** Open a past session, scrub the timeline, click play, verify events stream in
- **Command palette:** Press ⌘K, type, hit enter, verify it works

### 9.4 Manual Smoke Tests (in CI)

- Build the daemon → run a real pi session with `--provider anthropic` → verify exit code 0
- Build the browser → load it in a headless browser → verify no console errors
- Run the Docker image → verify it starts and the health check passes

### 9.5 Coverage Targets

- 80%+ on the daemon (it's the critical path)
- 60%+ on the browser (UI code is harder to cover meaningfully)
- 100% on the shared types module

---

## 10. Deployment

### 10.1 npm Distribution

```bash
npm install -g pi-studio
pi-studio
# → daemon starts on :7331, browser opens http://localhost:7331
```

The `pi-studio` package ships:
- The compiled daemon (Node.js)
- The compiled browser (static files)
- A `pi-studio` CLI that starts the daemon and opens the browser

### 10.2 Docker Distribution

```bash
docker run -d \
  -p 7331:7331 \
  -v ~/.pi:/root/.pi:ro \
  -v pi-studio-data:/data \
  -e PI_STUDIO_PASSWORD=changeme \
  --name pi-studio \
  10xdev4u-alt/pi-studio
```

The image is based on `node:22-slim`, runs as non-root, includes health check.

### 10.3 Self-Hosted Security

- Binds to `127.0.0.1` by default (not exposed to LAN)
- For LAN access: set `PI_STUDIO_HOST=0.0.0.0` and `PI_STUDIO_PASSWORD=<strong>`
- For public access: **put it behind a reverse proxy with TLS** (Caddy, nginx, etc.) — we don't do TLS in-process
- All session data stays on the host

### 10.4 Configuration

Via env vars or a `~/.pi-studio/config.toml`:

```toml
[server]
host = "127.0.0.1"
port = 7331

[auth]
# If unset, browser shows a "set your password" screen on first run
password_hash = "$2b$10$..."

[pi]
# Path to the pi binary (default: whatever's on $PATH)
binary = "pi"
# Default provider/model for new runs
provider = "anthropic"
model = "claude-opus-4-8"

[storage]
# Where to store session metadata (default: ~/.pi-studio/data.db)
database_path = "~/.pi-studio/data.db"
```

---

## 11. Project Structure

```
pi-studio/
├── README.md
├── LICENSE
├── .gitignore
├── package.json                    # root: workspaces for browser + daemon + shared
├── pnpm-workspace.yaml             # or npm workspaces
│
├── packages/
│   ├── shared/                     # shared types, event schemas
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── events.ts           # the Event type union
│   │   │   ├── run.ts              # Run, Agent, etc.
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   │
│   ├── daemon/                     # the Node.js server
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts            # entry point
│   │   │   ├── server.ts           # Fastify setup
│   │   │   ├── routes/             # REST API routes
│   │   │   ├── ws/                 # WebSocket hub
│   │   │   ├── pi/                 # pi subprocess manager
│   │   │   ├── sessions/           # file tailer + session store
│   │   │   ├── db/                 # SQLite layer
│   │   │   └── auth/               # bcrypt + cookies
│   │   ├── tests/
│   │   └── tsconfig.json
│   │
│   └── browser/                    # the Next.js app
│       ├── package.json
│       ├── next.config.ts
│       ├── app/                    # App Router
│       │   ├── layout.tsx
│       │   ├── page.tsx            # main live run view
│       │   ├── runs/[id]/page.tsx  # session detail / replay
│       │   ├── gallery/page.tsx    # past runs gallery
│       │   ├── settings/page.tsx
│       │   └── api/                # Next.js API routes (proxy to daemon)
│       ├── components/
│       │   ├── ui/                 # primitives (button, modal, etc.)
│       │   ├── run/                # live run view components
│       │   ├── replay/             # replay view components
│       │   ├── gallery/            # gallery components
│       │   └── palette/            # command palette
│       ├── lib/
│       │   ├── ws.ts               # WebSocket client
│       │   ├── api.ts              # REST client
│       │   └── utils.ts
│       ├── styles/
│       │   ├── globals.css         # design tokens, base styles
│       │   └── themes.css
│       ├── public/
│       └── tests/
│
├── examples/                       # example pi sessions to demo Pi Studio with
│   ├── scout-and-plan.json         # exported pi session
│   ├── codebuff-loop.json
│   └── ...
│
├── scripts/
│   ├── dev.sh                      # start daemon + browser in dev mode
│   ├── build.sh                    # build everything
│   └── smoke.sh                    # run a real pi session to verify
│
└── docs/
    ├── superpowers/
    │   └── specs/
    │       └── 2026-06-14-pi-studio-design.md   # this file
    ├── architecture.md             # deeper architecture notes
    └── api.md                      # API reference (generated)
```

---

## 12. Implementation Plan (Outline)

This is a high-level outline. The detailed plan will be created via the writing-plans skill after this spec is approved.

**Phase 0: Bootstrap (1-2 hours)**
- [ ] Set up monorepo (npm workspaces or pnpm)
- [ ] Configure TypeScript, ESLint, Prettier, Vitest
- [ ] Set up CI (GitHub Actions: test on PR, build on tag)
- [ ] Write the shared types package
- [ ] Stub the daemon and browser with "hello world"

**Phase 1: Daemon Core (4-6 hours)**
- [ ] Fastify server with health check
- [ ] SQLite schema + migration
- [ ] pi subprocess spawner with flags
- [ ] File tailer (chokidar) on session JSONL
- [ ] Stdout JSON reader
- [ ] Event bus that merges both feeds
- [ ] Basic REST endpoints (`/api/runs`, `/api/runs/:id`)
- [ ] WebSocket hub with subscribe/broadcast
- [ ] Auth (bcrypt + httpOnly cookies)
- [ ] Unit + integration tests

**Phase 2: Browser Foundation (3-4 hours)**
- [ ] Next.js 15 setup with App Router
- [ ] Design tokens (CSS variables) + base styles
- [ ] Typography (Fraunces + Geist + JetBrains Mono)
- [ ] Layout shell (sidebar + center + right panel + bottom bar)
- [ ] WebSocket client with auto-reconnect
- [ ] REST API client
- [ ] State management (Zustand or Jotai)
- [ ] Theme (dark mode default, light mode later)

**Phase 3: Live Run View (4-6 hours)**
- [ ] Agent list (sidebar) with personality + thinking halos
- [ ] Active agent card (center)
- [ ] Event stream (right panel)
- [ ] Constellation mini-map (React Flow)
- [ ] Metrics dashboard (Recharts)
- [ ] Bottom command bar

**Phase 4: Approval + Detail + Gallery (4-6 hours)**
- [ ] Approval modal with diff viewer
- [ ] Session detail / replay view with timeline scrubber
- [ ] Past runs gallery with filters
- [ ] Command palette (⌘K)

**Phase 5: Polish + Deploy (2-3 hours)**
- [ ] Empty states with illustrations
- [ ] Error states with helpful messages
- [ ] Loading states (shimmer, not skeletons)
- [ ] Toasts for success/error
- [ ] Keyboard shortcuts overlay (?)
- [ ] npm package + Docker image
- [ ] Smoke test script
- [ ] README + docs

**Total estimate: 18-27 hours of focused work.**

This is a multi-session build. v0.1.0 ships when Phase 1-5 are done.

---

## 13. Success Criteria

v0.1.0 is done when:

1. ✅ A developer can `git clone`, `npm install`, `npm run dev`, and have a working Pi Studio in under 5 minutes
2. ✅ They can start a real pi run from the browser and watch the multi-agent activity live
3. ✅ They can approve, reject, or edit a tool call from a modal
4. ✅ They can browse all past runs in a gallery
5. ✅ They can scrub through any past run's timeline
6. ✅ They can press ⌘K and launch anything
7. ✅ It works on Chrome, Firefox, Safari (latest)
8. ✅ It looks like it belongs in a Stripe or Linear product gallery
9. ✅ The whole stack passes lint, typecheck, unit tests, integration tests, and E2E tests
10. ✅ It's installable via `npx pi-studio` AND `docker run`

---

## 14. Open Questions / Future Research

These are explicitly out of scope for v0.1.0 but worth tracking:

1. **Approval mechanism in `--print` mode** — does pi accept inline approvals via stdin, or do we need `--mode rpc` for that subset?
2. **Live stdout streaming reliability** — does `--mode json` actually give us a complete event stream, or just the final output? Need to test.
3. **Token pricing data** — do we hardcode a model→price table, or query a live source? (v0.1.0: hardcoded)
4. **Multi-tab sessions** — easy to add or a UX rabbit hole? (v0.1.0: no, v0.2 maybe)
5. **Custom agent configs** — let users define their own agents with custom prompts? (v0.1.0: no, use pi's existing agent system)
6. **Session forking** — start a new run from a specific point in a past run? (v0.1.0: no, pi has `--fork` but we won't expose it)

---

## 15. References

- [Pi coding agent](https://github.com/earendil-works/pi-coding-agent) — the host we're visualizing
- [Pi subagent extension](https://github.com/earendil-works/pi-coding-agent/tree/main/examples/extensions/subagent) — the multi-agent system
- [Codebuff](https://github.com/CodebuffAI/codebuff) — inspiration for the best-of-n multi-agent pattern
- [Linear](https://linear.app) — inspiration for the dashboard aesthetic
- [Vercel](https://vercel.com) — inspiration for the typography + motion
- [Raycast](https://raycast.com) — inspiration for the command palette
- [Stripe Dashboard](https://stripe.com) — inspiration for the data density + polish

---

**This spec is approved for implementation. The terminal state is to invoke the writing-plans skill to create the detailed implementation plan, then build.**
