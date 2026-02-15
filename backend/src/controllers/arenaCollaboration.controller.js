import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

/**
 * GET /api/arena-collaboration/:arenaId/collaborators
 * Lister les collaborateurs d'une arène
 */
export const getCollaborators = async (req, res, next) => {
  try {
    const { arenaId } = req.params;
    const userId = req.user.id;

    // Vérifier accès
    const access = await checkArenaAccess(userId, arenaId);
    if (!access) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à cette arène'
      });
    }

    // Récupérer le propriétaire de l'arène
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    // Récupérer les collaborateurs
    const collaborations = await prisma.arenaCollaboration.findMany({
      where: { arenaId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    // Créer l'entrée du propriétaire au format collaboration
    const ownerAsCollaborator = {
      id: 'owner',
      arenaId,
      userId: arena.userId,
      role: 'owner',
      joinedAt: arena.createdAt,
      user: arena.user
    };

    // Combiner propriétaire + collaborateurs
    const allCollaborators = [ownerAsCollaborator, ...collaborations];

    res.json({
      success: true,
      data: { collaborators: allCollaborators }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/arena-collaboration/:arenaId/collaborators
 * Inviter un collaborateur par email
 */
export const addCollaborator = async (req, res, next) => {
  try {
    const { arenaId } = req.params;
    const { email, role } = req.body;
    const userId = req.user.id;

    // Vérifier ownership (seul owner peut inviter)
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId }
    });

    if (!arena) {
      return res.status(404).json({
        success: false,
        message: 'Arène non trouvée'
      });
    }

    if (arena.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut inviter des collaborateurs'
      });
    }

    // Trouver l'utilisateur par email
    const targetUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé avec cet email'
      });
    }

    // Vérifier si c'est le propriétaire
    if (targetUser.id === arena.userId) {
      return res.status(400).json({
        success: false,
        message: 'Le propriétaire est déjà dans l\'arène'
      });
    }

    // Vérifier si déjà collaborateur
    const existing = await prisma.arenaCollaboration.findUnique({
      where: {
        arenaId_userId: {
          arenaId,
          userId: targetUser.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur est déjà collaborateur'
      });
    }

    // Créer la collaboration
    const collaboration = await prisma.arenaCollaboration.create({
      data: {
        arenaId,
        userId: targetUser.id,
        role,
        invitedBy: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Émettre event socket pour notifier les collaborateurs connectés
    req.app.get('io')?.to(`arena:${arenaId}`).emit('collaborator:added', {
      collaboration
    });

    res.status(201).json({
      success: true,
      message: 'Collaborateur ajouté avec succès',
      data: { collaboration }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/arena-collaboration/:arenaId/collaborators/:userId
 * Retirer un collaborateur
 */
export const removeCollaborator = async (req, res, next) => {
  try {
    const { arenaId, userId: targetUserId } = req.params;
    const userId = req.user.id;

    // Vérifier ownership
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId }
    });

    if (!arena || arena.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut retirer des collaborateurs'
      });
    }

    // Supprimer la collaboration
    await prisma.arenaCollaboration.delete({
      where: {
        arenaId_userId: {
          arenaId,
          userId: targetUserId
        }
      }
    });

    // Émettre event pour déconnecter l'utilisateur retiré
    req.app.get('io')?.to(`arena:${arenaId}`).emit('collaborator:removed', {
      userId: targetUserId
    });

    res.json({
      success: true,
      message: 'Collaborateur retiré'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/arena-collaboration/:arenaId/leave
 * Quitter une arène (pour un collaborateur)
 */
export const leaveArena = async (req, res, next) => {
  try {
    const { arenaId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur n'est pas le propriétaire
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId }
    });

    if (arena.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Le propriétaire ne peut pas quitter son arène'
      });
    }

    // Supprimer la collaboration
    await prisma.arenaCollaboration.delete({
      where: {
        arenaId_userId: {
          arenaId,
          userId
        }
      }
    });

    // Émettre event
    req.app.get('io')?.to(`arena:${arenaId}`).emit('user:left', {
      user: req.user
    });

    res.json({
      success: true,
      message: 'Vous avez quitté l\'arène'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/arena-collaboration/:arenaId/share-links
 * Lister les liens de partage
 */
export const getShareLinks = async (req, res, next) => {
  try {
    const { arenaId } = req.params;
    const userId = req.user.id;

    // Vérifier ownership
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId }
    });

    if (!arena || arena.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut voir les liens de partage'
      });
    }

    const shareLinks = await prisma.arenaShareLink.findMany({
      where: { arenaId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { shareLinks }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/arena-collaboration/:arenaId/share-links
 * Créer un lien de partage
 */
export const createShareLink = async (req, res, next) => {
  try {
    const { arenaId } = req.params;
    const { role, expiresIn, maxUsage } = req.body;
    const userId = req.user.id;

    // Vérifier ownership
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId }
    });

    if (!arena || arena.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut créer des liens de partage'
      });
    }

    // Générer token unique (10 caractères alphanumériques)
    const token = nanoid(10);

    // Calculer expiration
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    }

    const shareLink = await prisma.arenaShareLink.create({
      data: {
        arenaId,
        token,
        role,
        expiresAt,
        maxUsage,
        createdBy: userId
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    res.status(201).json({
      success: true,
      message: 'Lien de partage créé',
      data: {
        shareLink,
        url: `${frontendUrl}/arena/join/${token}`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/arena-collaboration/:arenaId/share-links/:linkId
 * Supprimer un lien de partage
 */
export const deleteShareLink = async (req, res, next) => {
  try {
    const { arenaId, linkId } = req.params;
    const userId = req.user.id;

    // Vérifier ownership
    const arena = await prisma.arena.findUnique({
      where: { id: arenaId }
    });

    if (!arena || arena.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut supprimer des liens'
      });
    }

    await prisma.arenaShareLink.delete({
      where: { id: linkId }
    });

    res.json({
      success: true,
      message: 'Lien supprimé'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/arena-collaboration/join/:token
 * Rejoindre une arène via lien partageable
 */
export const joinViaToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    // Trouver le lien
    const shareLink = await prisma.arenaShareLink.findUnique({
      where: { token },
      include: {
        arena: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    });

    if (!shareLink) {
      return res.status(404).json({
        success: false,
        message: 'Lien de partage invalide'
      });
    }

    // Vérifier expiration
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'Ce lien a expiré'
      });
    }

    // Vérifier max usage
    if (shareLink.maxUsage && shareLink.usageCount >= shareLink.maxUsage) {
      return res.status(410).json({
        success: false,
        message: 'Ce lien a atteint sa limite d\'utilisation'
      });
    }

    // Vérifier si déjà propriétaire ou collaborateur
    console.log(`[Join] User ${userId} trying to join arena ${shareLink.arenaId}`);
    console.log(`[Join] Arena owner: ${shareLink.arena.userId}`);

    if (shareLink.arena.userId === userId) {
      console.log('[Join] User is already owner');
      return res.json({
        success: true,
        message: 'Vous êtes déjà propriétaire de cette arène',
        data: {
          arenaId: shareLink.arenaId,
          alreadyMember: true
        }
      });
    }

    const existing = await prisma.arenaCollaboration.findUnique({
      where: {
        arenaId_userId: {
          arenaId: shareLink.arenaId,
          userId
        }
      }
    });

    if (existing) {
      console.log('[Join] User is already collaborator');
      return res.json({
        success: true,
        message: 'Vous êtes déjà collaborateur',
        data: {
          arenaId: shareLink.arenaId,
          alreadyMember: true
        }
      });
    }

    // Créer la collaboration avec gestion d'erreur pour race condition
    console.log('[Join] Creating new collaboration');
    let collaboration;
    try {
      collaboration = await prisma.arenaCollaboration.create({
        data: {
          arenaId: shareLink.arenaId,
          userId,
          role: shareLink.role,
          invitedBy: shareLink.createdBy
        }
      });
    } catch (error) {
      // Si erreur de contrainte unique (race condition), considérer comme déjà membre
      if (error.code === 'P2002') {
        console.log('[Join] Race condition detected, user already added');
        return res.json({
          success: true,
          message: 'Vous êtes déjà membre de cette arène',
          data: {
            arenaId: shareLink.arenaId,
            alreadyMember: true
          }
        });
      }
      throw error;
    }

    // Incrémenter usage count
    await prisma.arenaShareLink.update({
      where: { id: shareLink.id },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });

    // Émettre event socket
    req.app.get('io')?.to(`arena:${shareLink.arenaId}`).emit('collaborator:joined', {
      user: req.user,
      role: shareLink.role
    });

    res.json({
      success: true,
      message: `Vous avez rejoint l'arène "${shareLink.arena.title}"`,
      data: {
        arenaId: shareLink.arenaId,
        collaboration
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/arena-collaboration/:arenaId/activities
 * Historique des activités d'une arène
 */
export const getActivities = async (req, res, next) => {
  try {
    const { arenaId } = req.params;
    const userId = req.user.id;

    // Vérifier accès
    const access = await checkArenaAccess(userId, arenaId);
    if (!access) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const activities = await prisma.arenaActivity.findMany({
      where: { arenaId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limiter à 50 dernières activités
    });

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Vérifier accès à une arène
 */
export async function checkArenaAccess(userId, arenaId, requiredRole = null) {
  const arena = await prisma.arena.findUnique({
    where: { id: arenaId }
  });

  if (!arena) return null;

  // Owner a tous les droits
  if (arena.userId === userId) {
    return { role: 'owner', arena };
  }

  // Vérifier collaboration
  const collaboration = await prisma.arenaCollaboration.findUnique({
    where: {
      arenaId_userId: { arenaId, userId }
    }
  });

  if (!collaboration) return null;

  // Vérifier rôle requis
  if (requiredRole) {
    const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
    if (roleHierarchy[collaboration.role] < roleHierarchy[requiredRole]) {
      return null;
    }
  }

  return { role: collaboration.role, collaboration };
}
