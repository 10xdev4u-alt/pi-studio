# π Studio

> Browser-based multi-agent UI for the [pi coding harness](https://github.com/earendil-works/pi-coding-agent) — visualize, orchestrate, and replay agent runs in real time.

![status](https://img.shields.io/badge/status-v0.1.0-8b5cf6?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![ci](https://img.shields.io/badge/CI-passing-4ade80?style=flat-square)
![stack](https://img.shields.io/badge/stack-Next.js%2015%20%2B%20TypeScript%20%2B%20Node%2022-000?style=flat-square)

## What is it?

Pi Studio is the **missing front-end for pi's multi-agent loops**. Where pi is a fast, TUI-native coding harness, Pi Studio gives you a browser-native experience: live multi-agent visualization, real-time metrics, approval workflows, session replay, and a session library — all running against real pi subprocesses.

Think: **Linear meets Vercel meets a live mission control for AI agents**.

## 🚀 Quick start (Docker)

The fastest way to run Pi Studio:

```bash
docker run -d \
  --name pi-studio \
  -p 7331:7331 \
  -p 3000:3000 \
  ghcr.io/10xdev4u-alt/pi-studio:latest
```

Then open:
- **Browser UI:** http://localhost:3000
- **Daemon API:** http://localhost:7331/api/health

## 🛠️ Local development

Clone, install, run:

```bash
git clone https://github.com/10xdev4u-alt/pi-studio.git
cd pi-studio
npm install
npm run dev
```

This starts both the daemon (port 7331) and the browser (port 3000) concurrently. Open http://localhost:3000.

## 📦 What's in the box

- **Real pi integration** — spawns `pi` subprocesses with `--mode json --print --session-id`, tails the JSONL session file, streams stdout events, merges both into a unified event stream
- **Live multi-agent visualization** — agent personalities (color + symbol), thinking halos, constellation mini-map
- **Real-time metrics** — token in/out, cost (with projections), elapsed time, sparkline charts
- **Approval workflow** — modal pops up when an agent needs sign-off, full diff preview, 3-button decision (reject / edit / approve)
- **Session detail / replay** — scrubbable timeline with color-coded event pins, play/pause, speed control
- **Past runs gallery** — filterable grid of all sessions with status, duration, cost
- **Command palette (⌘K)** — Raycast-tier global launcher
- **Self-hostable** — single Docker image, no cloud dependency, no telemetry

## 🎨 Aesthetic: "Linear Flux"

Dark mode, deep `#08080d` base, indigo→purple→pink gradient accents, Fraunces variable serif for display, Geist for body, JetBrains Mono for code. Slow-shifting gradient mesh background. Agent personality (each agent gets a unique color + symbol + thinking halo). No Inter, no purple-on-white, no AI-slop.

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (Next.js 15)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Live Run │ │  Replay  │ │  Gallery │ │ Command  │         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
│       │            │            │            │               │
│       └────────────┴─────┬──────┴────────────┘               │
│                          │ WebSocket (binary + JSON)         │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    pi-studio daemon (Fastify)                 │
│   ┌─────────────────┐   │   ┌─────────────────┐              │
│   │  HTTP server    │◄──┼──►│ WebSocket /ws   │              │
│   │  /api/* routes  │   │   │  (via hub.ts)   │              │
│   └────────┬────────┘   │   └────────┬────────┘              │
│            │            │            │                       │
│   ┌────────▼────────┐   │   ┌────────▼────────┐              │
│   │  SQLite (runs)  │   │   │  EventBus       │              │
│   └─────────────────┘   │   └────────┬────────┘              │
│                         │            │                       │
│                         │   ┌────────▼────────┐              │
│                         │   │  RunManager     │              │
│                         │   └────────┬────────┘              │
│                         │            │                       │
│                         │   ┌────────▼────────┐              │
│                         │   │  pi subprocess  │              │
│                         │   │  + JSONL tailer │              │
│                         │   └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project structure

```
pi-studio/
├── packages/
│   ├── shared/      # Event + Run types
│   ├── daemon/      # Fastify + SQLite + WebSocket + pi spawner
│   └── browser/     # Next.js 15 + React 19 + Tailwind v4
├── docs/
│   ├── superpowers/
│   │   ├── specs/   # design spec
│   │   └── plans/   # 55-task implementation plan
│   └── ARCHITECTURE.md
├── Dockerfile
├── docker-entrypoint.sh
└── .github/workflows/ci.yml
```

## 🔧 Configuration

Via env vars or `~/.pi-studio/config.toml`:

```bash
PI_STUDIO_HOST=127.0.0.1     # bind host
PI_STUDIO_PORT=7331          # daemon port
PI_STUDIO_DB=~/.pi-studio/data.db  # SQLite path
PI_STUDIO_PASSWORD=changeme  # optional, gates the UI
```

## 🧪 Development

```bash
npm test              # run all tests (Vitest)
npm run typecheck     # tsc -p tsconfig.json --noEmit
npm run lint          # ESLint v9 flat config
npm run build         # build all workspaces
```

CI runs on every push to `main` (`.github/workflows/ci.yml`): typecheck + lint + test + build.

## 📊 Stats

- 54 atomic commits
- 19 tests passing (16 daemon + 3 shared)
- 0 lint errors
- 0 typecheck errors
- Production build clean
- Docker image: ~500MB

## 🗺️ Roadmap

- **v0.2** — multi-tab runs, custom agent presets, custom themes
- **v0.3** — public gallery, shareable HTML exports, social features
- **v1.0** — multi-user accounts, hosted SaaS option

## 📜 License

MIT

---

Built by [10xdev4u-alt](https://github.com/10xdev4u-alt) (Princyy) with the help of pi's multi-agent loops. 🫡
