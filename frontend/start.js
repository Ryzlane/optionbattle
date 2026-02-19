#!/usr/bin/env node

import { spawn } from 'child_process';

const port = process.env.PORT || '4173';

console.log(`🚀 Starting production server on port ${port}...`);
console.log(`📍 Railway PORT env: ${process.env.PORT || 'not set (using default 4173)'}`);

// Use 'serve' for production static file serving
// -s = single page app mode (rewrites all not-found requests to index.html)
// serve reads PORT environment variable automatically and listens on 0.0.0.0
const child = spawn('serve', ['-s', 'dist'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: port // Explicitly pass PORT to serve
  }
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
