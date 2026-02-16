import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSocketIO } from './socket/index.js';
import authRoutes from './routes/auth.routes.js';
import battleRoutes from './routes/battle.routes.js';
import badgeRoutes from './routes/badge.routes.js';
import templateRoutes from './routes/template.routes.js';
import collaborationRoutes from './routes/collaboration.routes.js';
import arenaRoutes from './routes/arena.routes.js';
import arenaCollaborationRoutes from './routes/arenaCollaboration.routes.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Créer HTTP server pour Socket.io
const httpServer = createServer(app);

// Sécurité
app.use(helmet());

// CORS - Autoriser le frontend (Railway ou local)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL] // Railway frontend URL
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.some(allowed => allowed && origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS bloqué pour origin: ${origin}`);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true
}));

// Rate limiting global
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 en dev, 100 en prod
  message: {
    success: false,
    message: 'Trop de requêtes, réessayez plus tard'
  }
});

// Rate limiting pour auth (plus strict en production, permissif en dev)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 100 tentatives en dev, 5 en prod
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, réessayez plus tard'
  }
});

// Appliquer le rate limiting seulement en production
if (process.env.NODE_ENV === 'production') {
  app.use(generalLimiter);
}

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'OptionBattle API is running ⚔️',
    timestamp: new Date().toISOString()
  });
});

// Auth routes avec rate limiting spécifique
app.use('/api/auth', authLimiter, authRoutes);

// Battle routes (protégées par le middleware protect dans les routes)
app.use('/api/battles', battleRoutes);

// Badge routes (protégées)
app.use('/api/badges', badgeRoutes);

// Template routes (protégées)
app.use('/api/templates', templateRoutes);

// Collaboration routes (protégées)
app.use('/api/collaboration', collaborationRoutes);

// Arena routes (protégées)
app.use('/api/arenas', arenaRoutes);

// Arena collaboration routes (protégées sauf join/:token)
app.use('/api/arena-collaboration', arenaCollaborationRoutes);

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Error handler (doit être en dernier)
app.use(errorHandler);

// Setup Socket.io pour collaboration temps réel
const io = setupSocketIO(httpServer);

// Rendre io accessible dans les routes (pour émettre des events)
app.set('io', io);

// Démarrer le serveur HTTP
httpServer.listen(PORT, () => {
  console.log(`⚔️  OptionBattle API lancée sur http://localhost:${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket activé pour collaboration temps réel`);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
