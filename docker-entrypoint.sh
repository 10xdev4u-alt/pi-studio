#!/bin/sh
# Start the daemon in the background, then start the browser in foreground
set -e

# Ensure data dir exists and is writable by node user
mkdir -p /home/node/.pi-studio
chown -R node:node /home/node/.pi-studio

echo "[pi-studio] starting daemon on :7331..."
node /app/packages/daemon/dist/index.js &
DAEMON_PID=$!
echo "[pi-studio] daemon pid: $DAEMON_PID"

# Wait for daemon to be ready
for i in $(seq 1 30); do
  if node -e "fetch('http://127.0.0.1:7331/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    echo "[pi-studio] daemon ready"
    break
  fi
  sleep 0.5
done

echo "[pi-studio] starting browser on :3000..."
cd /app/packages/browser
exec npx next start -p 3000 -H 0.0.0.0
