import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { sendInvitationEmail } from '../services/email.service.js';

const prisma = new PrismaClient();

/**
 * GET /api/collaboration/:battleId/collaborators
 * Lister les collaborateurs d'une battle
 */
export const getCollaborators = async (req, res, next) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    // Vérifier accès
    const access = await checkBattleAccess(userId, battleId);
    if (!access) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à cette battle'
      });
    }

    // Récupérer le propriétaire de la battle
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
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
    const collaborations = await prisma.collaboration.findMany({
      where: { battleId },
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
      battleId,
      userId: battle.userId,
      role: 'owner',
      joinedAt: battle.createdAt,
      user: battle.user
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
 * POST /api/collaboration/:battleId/collaborators
 * Inviter un collaborateur par email
 */
export const addCollaborator = async (req, res, next) => {
  try {
    const { battleId } = req.params;
    const { email, role } = req.body;
    const userId = req.user.id;

    // Vérifier ownership (seul owner peut inviter)
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    if (battle.userId !== userId) {
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
    if (targetUser.id === battle.userId) {
      return res.status(400).json({
        success: false,
        message: 'Le propriétaire est déjà dans la battle'
      });
    }

    // Vérifier si déjà collaborateur
    const existing = await prisma.collaboration.findUnique({
      where: {
        battleId_userId: {
          battleId,
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
    const collaboration = await prisma.collaboration.create({
      data: {
        battleId,
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

    // Envoyer email d'invitation
    try {
      const battleUrl = `${process.env.FRONTEND_URL}/battles/${battleId}`;
      await sendInvitationEmail(
        targetUser.email,
        req.user.name || req.user.email,
        'battle',
        battle.title,
        battleUrl
      );
    } catch (emailError) {
      console.error('Erreur envoi email invitation:', emailError);
      // Ne pas bloquer la création de la collaboration si l'email échoue
    }

    // Émettre event socket pour notifier les collaborateurs connectés
    req.app.get('io')?.to(`battle:${battleId}`).emit('collaborator:added', {
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
 * PATCH /api/collaboration/:battleId/collaborators/:userId
 * Modifier le rôle d'un collaborateur
 */
export const updateCollaboratorRole = async (req, res, next) => {
  try {
    const { battleId, userId: targetUserId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    // Vérifier ownership
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle || battle.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut modifier les rôles'
      });
    }

    // Mettre à jour le rôle
    const collaboration = await prisma.collaboration.update({
      where: {
        battleId_userId: {
          battleId,
          userId: targetUserId
        }
      },
      data: { role },
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

    // Émettre event socket
    req.app.get('io')?.to(`battle:${battleId}`).emit('collaborator:roleUpdated', {
      userId: targetUserId,
      role
    });

    res.json({
      success: true,
      message: 'Rôle mis à jour',
      data: { collaboration }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/collaboration/:battleId/collaborators/:userId
 * Retirer un collaborateur
 */
export const removeCollaborator = async (req, res, next) => {
  try {
    const { battleId, userId: targetUserId } = req.params;
    const userId = req.user.id;

    // Vérifier ownership
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle || battle.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut retirer des collaborateurs'
      });
    }

    // Supprimer la collaboration
    await prisma.collaboration.delete({
      where: {
        battleId_userId: {
          battleId,
          userId: targetUserId
        }
      }
    });

    // Émettre event pour déconnecter l'utilisateur retiré
    req.app.get('io')?.to(`battle:${battleId}`).emit('collaborator:removed', {
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
 * POST /api/collaboration/:battleId/leave
 * Quitter une battle (pour un collaborateur)
 */
export const leaveBattle = async (req, res, next) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur n'est pas le propriétaire
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (battle.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Le propriétaire ne peut pas quitter sa battle'
      });
    }

    // Supprimer la collaboration
    await prisma.collaboration.delete({
      where: {
        battleId_userId: {
          battleId,
          userId
        }
      }
    });

    // Émettre event
    req.app.get('io')?.to(`battle:${battleId}`).emit('user:left', {
      user: req.user
    });

    res.json({
      success: true,
      message: 'Vous avez quitté la battle'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/collaboration/:battleId/share-links
 * Lister les liens de partage
 */
export const getShareLinks = async (req, res, next) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    // Vérifier ownership
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle || battle.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut voir les liens de partage'
      });
    }

    const shareLinks = await prisma.shareLink.findMany({
      where: { battleId },
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
 * POST /api/collaboration/:battleId/share-links
 * Créer un lien de partage
 */
export const createShareLink = async (req, res, next) => {
  try {
    const { battleId } = req.params;
    const { role, expiresIn, maxUsage } = req.body;
    const userId = req.user.id;

    // Vérifier ownership
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle || battle.userId !== userId) {
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

    const shareLink = await prisma.shareLink.create({
      data: {
        battleId,
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
        url: `${frontendUrl}/battle/join/${token}`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/collaboration/:battleId/share-links/:linkId
 * Supprimer un lien de partage
 */
export const deleteShareLink = async (req, res, next) => {
  try {
    const { battleId, linkId } = req.params;
    const userId = req.user.id;

    // Vérifier ownership
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle || battle.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut supprimer des liens'
      });
    }

    await prisma.shareLink.delete({
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
 * POST /api/collaboration/join/:token
 * Rejoindre une battle via lien partageable
 */
export const joinViaShareLink = async (req, res, next) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    // Trouver le lien
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        battle: {
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
    console.log(`[Join] User ${userId} trying to join battle ${shareLink.battleId}`);
    console.log(`[Join] Battle owner: ${shareLink.battle.userId}`);

    if (shareLink.battle.userId === userId) {
      console.log('[Join] User is already owner');
      return res.json({
        success: true,
        message: 'Vous êtes déjà propriétaire de cette battle',
        data: {
          battleId: shareLink.battleId,
          alreadyMember: true
        }
      });
    }

    const existing = await prisma.collaboration.findUnique({
      where: {
        battleId_userId: {
          battleId: shareLink.battleId,
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
          battleId: shareLink.battleId,
          alreadyMember: true
        }
      });
    }

    // Créer la collaboration avec gestion d'erreur pour race condition
    console.log('[Join] Creating new collaboration');
    let collaboration;
    try {
      collaboration = await prisma.collaboration.create({
        data: {
          battleId: shareLink.battleId,
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
          message: 'Vous êtes déjà membre de cette battle',
          data: {
            battleId: shareLink.battleId,
            alreadyMember: true
          }
        });
      }
      throw error;
    }

    // Incrémenter usage count
    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });

    // Émettre event socket
    req.app.get('io')?.to(`battle:${shareLink.battleId}`).emit('collaborator:joined', {
      user: req.user,
      role: shareLink.role
    });

    res.json({
      success: true,
      message: `Vous avez rejoint la battle "${shareLink.battle.title}"`,
      data: {
        battleId: shareLink.battleId,
        collaboration
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/collaboration/:battleId/activities
 * Historique des activités d'une battle
 */
export const getActivities = async (req, res, next) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    // Vérifier accès
    const access = await checkBattleAccess(userId, battleId);
    if (!access) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const activities = await prisma.activity.findMany({
      where: { battleId },
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

// Helper: Vérifier accès à une battle
async function checkBattleAccess(userId, battleId, requiredRole = null) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId }
  });

  if (!battle) return null;

  // Owner a tous les droits
  if (battle.userId === userId) {
    return { role: 'owner', battle };
  }

  // Vérifier collaboration directe sur la battle
  const collaboration = await prisma.collaboration.findUnique({
    where: {
      battleId_userId: { battleId, userId }
    }
  });

  if (collaboration) {
    // Vérifier rôle requis
    if (requiredRole) {
      const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
      if (roleHierarchy[collaboration.role] < roleHierarchy[requiredRole]) {
        return null;
      }
    }
    return { role: collaboration.role, collaboration };
  }

  // Vérifier si membre de l'arène contenant cette battle
  if (battle.arenaId) {
    // Récupérer l'arène pour vérifier ownership
    const arena = await prisma.arena.findUnique({
      where: { id: battle.arenaId }
    });

    // Owner de l'arène ?
    if (arena && arena.userId === userId) {
      return { role: 'owner', arena };
    }

    // Collaborateur de l'arène ?
    const arenaCollab = await prisma.arenaCollaboration.findUnique({
      where: { arenaId_userId: { arenaId: battle.arenaId, userId } }
    });
    if (arenaCollab) {
      if (requiredRole) {
        const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
        if (roleHierarchy[arenaCollab.role] < roleHierarchy[requiredRole]) {
          return null;
        }
      }
      return { role: arenaCollab.role, arenaCollab };
    }
  }

  return null;
}
