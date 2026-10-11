import type { Server as HttpServer } from 'node:http';

import logger from './logger.js';

type ShutdownTarget = {
  server: HttpServer;
  /** Stops the background loop (mail worker) and drains in-flight work. */
  stop: () => Promise<void>;
};

/**
 * Teardown on SIGINT/SIGTERM: stop accepting new work, let the loops drain,
 * then exit.
 */
export function registerShutdown({ server, stop }: ShutdownTarget): void {
  let shuttingDown = false;

  async function shutdown(signal: string) {
    // Node runs signal handlers in sequence. If a second signal arrives while
    // the first is still awaiting, it must not start teardown again.
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    logger.info({ signal }, 'Shutting down');

    // `server.close()` waits for in-flight requests, so it is not awaited here.
    server.close();
    await stop();

    process.exit(0);
  }

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}
