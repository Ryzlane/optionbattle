import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Submit feedback
 * POST /api/feedback
 */
export const submitFeedback = async (req, res) => {
  try {
    const { email, message, screenshot, pageUrl, userAgent } = req.body;
    const userId = req.user?.id || null;

    // Validation: au moins un de email ou message doit être fourni
    if (!message && !screenshot) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un message ou une capture d\'écran est requis'
      });
    }

    // Créer le feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        email: email || req.user?.email || null,
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
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du feedback'
    });
  }
};

/**
 * Get all feedbacks (admin only - optional future feature)
 * GET /api/feedback
 */
export const getFeedbacks = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = status ? { status } : {};

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.feedback.count({ where });

    res.json({
      success: true,
      data: {
        feedbacks,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des feedbacks'
    });
  }
};

/**
 * Update feedback status (admin only)
 * PATCH /api/feedback/:id
 */
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les administrateurs peuvent modifier le statut des feedbacks'
      });
    }

    // Validation des statuts
    if (!['pending', 'in_progress', 'archived', 'completed'].includes(status)) {
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
      message: 'Statut mis à jour',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du feedback'
    });
  }
};
