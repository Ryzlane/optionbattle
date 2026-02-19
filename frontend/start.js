#!/usr/bin/env node

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Starting server...');
console.log('📁 __dirname:', __dirname);
console.log('📦 dist exists:', existsSync(join(__dirname, 'dist')));
console.log('📄 index.html exists:', existsSync(join(__dirname, 'dist', 'index.html')));

const app = express();
const port = process.env.PORT || 3000;

console.log('🌍 All environment variables:', Object.keys(process.env).filter(k => k.includes('PORT')));

// Servir les fichiers statiques du dossier dist
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback - toutes les routes renvoient index.html
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Écouter sur 0.0.0.0 (toutes les interfaces) pour Railway
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${port}`);
  console.log(`📍 Railway PORT: ${process.env.PORT || 'not set (using 4173)'}`);
});
