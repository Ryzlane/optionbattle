import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { sendPasswordResetEmail, sendAccountDeletedEmail } from '../services/email.service.js';

const prisma = new PrismaClient();

/**
 * Register - Créer un nouveau compte
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Générer le token JWT
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login - Se connecter
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = generateToken(user.id);

    // Retourner les infos (sans le password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user - Récupérer le profil de l'utilisateur connecté
 */
export const me = async (req, res, next) => {
  try {
    // req.user est défini par le middleware protect
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * Demander un reset de mot de passe (public)
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });

    // TOUJOURS retourner succès (sécurité : ne pas révéler si email existe)
    if (!user) {
      return res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    // Générer token unique crypto-secure
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Sauvegarder token hashé (sécurité supplémentaire)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
        resetTokenExpires
      }
    });

    // Envoyer email
    await sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Réinitialiser le mot de passe avec token (public)
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hasher le token pour comparaison
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Trouver utilisateur avec token valide
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: {
          gt: new Date() // Token non expiré
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // Hasher nouveau password
    const hashedPassword = await hashPassword(password);

    // Mettre à jour password + clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/auth/delete-account
 * Supprimer son compte (protégé)
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Récupérer utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Vérifier password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }

    // Envoyer email de confirmation AVANT suppression
    await sendAccountDeletedEmail(user.email, user.name);

    // Supprimer utilisateur (cascade Prisma supprime tout)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};
