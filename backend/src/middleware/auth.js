import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

/**
 * Middleware d'authentification
 * Vérifie le token JWT et attache l'utilisateur à req.user
 */
export const protect = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié. Token manquant.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const decoded = verifyToken(token);

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

/**
 * Middleware d'authentification optionnelle
 * Attache l'utilisateur à req.user s'il est connecté, sinon req.user = null
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const decoded = verifyToken(token);

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};
