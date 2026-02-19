#!/usr/bin/env node

import { spawn } from 'child_process';

const port = process.env.PORT || '4173';

console.log(`🚀 Starting Vite preview server on port ${port}...`);

const child = spawn('vite', ['preview', '--host', '0.0.0.0', '--port', port], {
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
