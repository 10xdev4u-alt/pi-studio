export function setupGracefulShutdown(cleanup: () => Promise<void>): void {
  let shuttingDown = false;
  const handler = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n[daemon] received ${signal}, shutting down gracefully...`);
    try {
      await cleanup();
      process.exit(0);
    } catch (err) {
      console.error("[daemon] error during shutdown:", err);
      process.exit(1);
    }
  };
  process.on("SIGINT", () => void handler("SIGINT"));
  process.on("SIGTERM", () => void handler("SIGTERM"));
  process.on("uncaughtException", (err) => {
    console.error("[daemon] uncaught exception:", err);
    void handler("uncaughtException");
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[daemon] unhandled rejection:", reason);
  });
}
