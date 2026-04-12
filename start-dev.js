#!/usr/bin/env node
// Directly calls Next.js startServer() to bypass the fork/IPC mechanism
// that the Claude preview tool's disclaimer wrapper breaks.
// Do NOT set NEXT_PRIVATE_WORKER — that triggers IPC mode when process.send
// is available (which it is under the disclaimer wrapper).
process.env.TURBOPACK = '1';

const { startServer } = require('./node_modules/next/dist/server/lib/start-server');

const port = parseInt(process.env.PORT || '3000', 10);

startServer({
  dir: __dirname,
  port,
  isDev: true,
  allowRetry: false,
  hostname: 'localhost',
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
