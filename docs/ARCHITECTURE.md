// Quick start guide and architecture overview
# Pi Studio Architecture

## Three-Package Monorepo

```
pi-studio/
├── packages/
│   ├── shared/      # Event + Run types (consumed by both)
│   ├── daemon/      # Node.js server: spawns pi, streams events
│   └── browser/     # Next.js 15 app: visualizes events
└── docs/
    ├── superpowers/
    │   ├── specs/   # design spec
    │   └── plans/   # implementation plan
    └── ARCHITECTURE.md
```

## Data Flow

```
pi (subprocess) → JSONL file ─┐
                              ├─→ RunManager ─→ EventBus ─→ WebSocket ─→ Browser
            stdout JSON ──────┘
```

## Why this design

- **JSONL is the source of truth.** Pi already writes structured events. We don't parse terminal output.
- **Two feeds merged.** Stdout for low latency (~10-50ms), file for history + replay.
- **EventBus decouples producers from consumers.** Easy to add more sinks (log file, OTel, etc).
- **Browser is a pure consumer.** No business logic, just rendering.

## Status

- v0.1.0 design + 50+ commits in
- CI: passing
- Tests: 19 passing
- Typecheck: clean
- Build: clean
