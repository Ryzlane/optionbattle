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
// Force port 3000 to match Railway domain configuration
// Railway injects PORT=4173 but domain is configured for 3000
const port = 3000;

console.log('🌍 Railway injected PORT:', process.env.PORT);
console.log('🎯 Using forced port:', port);

// Servir les fichiers statiques du dossier dist
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback - toutes les routes renvoient index.html
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Écouter sur 0.0.0.0 (toutes les interfaces) pour Railway
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server listening on http://0.0.0.0:${port}`);
  console.log(`✅ Server ready! Visit optionbattle.ryzlane.com`);
});
