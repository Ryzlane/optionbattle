import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/feedback
 * Soumettre un nouveau feedback
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { message, screenshot, pageUrl, userAgent } = req.body;
    const userId = req.user?.id; // Optionnel si non connecté

    // Validation
    if (!pageUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL de la page requise'
      });
    }

    // Récupérer l'email de l'utilisateur si connecté
    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    }) : null;

    // Créer le feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        email: user?.email,
        message,
        screenshot,
        pageUrl,
        userAgent,
        status: 'pending'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Feedback envoyé avec succès',
      data: { feedback }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/feedback
 * Lister tous les feedbacks (admin only)
 */
export const getFeedbacks = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { feedbacks }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/feedback/:id
 * Mettre à jour le statut d'un feedback (admin only)
 */
export const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Feedback mis à jour',
      data: { feedback }
    });
  } catch (error) {
    next(error);
  }
};
