#!/usr/bin/env node

import { spawn } from 'child_process';

const port = process.env.PORT || '4173';

console.log(`🚀 Starting production server on port ${port}...`);

// Use 'serve' for production static file serving
// -s = single page app mode (rewrites all not-found requests to index.html)
// -l = listen address (0.0.0.0 for all interfaces, required for Railway)
// -p = port number
const child = spawn('serve', ['-s', 'dist', '-l', '0.0.0.0', '-p', port], {
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
