#!/usr/bin/env node

import { spawn } from 'child_process';

const port = process.env.PORT || '4173';

console.log(`🚀 Starting production server on port ${port}...`);
console.log(`📍 Railway PORT env: ${process.env.PORT || 'not set (using default 4173)'}`);

// Use 'serve' for production static file serving
// -s = single page app mode (rewrites all not-found requests to index.html)
// --listen with tcp:// format to bind to 0.0.0.0 (all interfaces, required for Railway)
const listenAddress = `tcp://0.0.0.0:${port}`;
console.log(`🌐 Listen address: ${listenAddress}`);

const child = spawn('serve', ['-s', 'dist', '--listen', listenAddress], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
