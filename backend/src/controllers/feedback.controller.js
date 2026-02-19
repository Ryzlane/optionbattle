import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitFeedback = async (req, res, next) => {
  try {
    const { message, screenshot, pageUrl, userAgent } = req.body;
    const userId = req.user?.id;

    if (!pageUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL de la page requise'
      });
    }

    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    }) : null;

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
      message: 'Feedback envoyé',
      data: { feedback }
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbacks = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
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
