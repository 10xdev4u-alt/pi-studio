#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[smoke] running a real pi session to verify the harness works..."
pi --print --mode json "echo hello from pi-studio smoke test" > /tmp/pi-smoke.json 2>&1 || {
  echo "[smoke] FAILED: pi subprocess exited non-zero"
  cat /tmp/pi-smoke.json
  exit 1
}
echo "[smoke] pi session ran successfully"
