// Entry point for the pi-studio daemon.
// Boots the Fastify server, opens the database, and starts the run manager.

async function main(): Promise<void> {
  console.log("π studio daemon starting...");
  // Real wiring lands in subsequent commits.
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("daemon failed to start:", err);
  process.exit(1);
});
