import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all arenas pour l'utilisateur connecté (owned + collaborated)
 */
export const getArenas = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Arenas dont l'utilisateur est propriétaire
    const ownedArenas = await prisma.arena.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            battles: true,
            collaborations: true
          }
        }
      }
    });

    // Arenas où l'utilisateur est collaborateur
    const collaborations = await prisma.arenaCollaboration.findMany({
      where: { userId },
      include: {
        arena: {
          include: {
            _count: {
              select: {
                battles: true,
                collaborations: true
              }
            }
          }
        }
      }
    });

    // Combiner
    const ownedArenasWithRole = ownedArenas.map(a => ({ ...a, role: 'owner' }));
    const collaboratedArenas = collaborations.map(c => ({
      ...c.arena,
      role: c.role,
      isCollaborator: true
    }));

    const allArenas = [...ownedArenasWithRole, ...collaboratedArenas];

    // Trier par date de mise à jour
    allArenas.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({
      success: true,
      data: { arenas: allArenas }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get une arena spécifique avec toutes ses battles
 */
export const getArena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer l'arène
    const arena = await prisma.arena.findUnique({
      where: { id },
      include: {
        battles: {
          include: {
            _count: {
              select: {
                fighters: true
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
        _count: {
          select: {
            collaborations: true
          }
        }
      }
    });

    if (!arena) {
      return res.status(404).json({
        success: false,
        message: 'Arène non trouvée'
      });
    }

    // Vérifier l'accès (owner ou collaborateur)
    const isOwner = arena.userId === userId;
    const collaboration = await prisma.arenaCollaboration.findUnique({
      where: {
        arenaId_userId: {
          arenaId: id,
          userId
        }
      }
    });

    if (!isOwner && !collaboration) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    // Ajouter le rôle de l'utilisateur
    const arenaWithRole = {
      ...arena,
      role: isOwner ? 'owner' : collaboration.role
    };

    res.json({
      success: true,
      data: { arena: arenaWithRole }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une nouvelle arena
 */
export const createArena = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    // Créer l'arène
    const arena = await prisma.arena.create({
      data: {
        title,
        description,
        userId
      }
    });

    // Logger l'activité
    await prisma.arenaActivity.create({
      data: {
        arenaId: arena.id,
        userId,
        action: 'arena_created',
        entityType: 'arena',
        entityId: arena.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Arène créée avec succès',
      data: { arena }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une arena
 */
export const updateArena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.id;

    // Vérifier que l'arène existe
    const arena = await prisma.arena.findUnique({
      where: { id }
    });

    if (!arena) {
      return res.status(404).json({
        success: false,
        message: 'Arène non trouvée'
      });
    }

    // Seul le propriétaire peut modifier l'arène
    if (arena.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut modifier l\'arène'
      });
    }

    // Mettre à jour
    const updatedArena = await prisma.arena.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      }
    });

    // Logger l'activité
    await prisma.arenaActivity.create({
      data: {
        arenaId: id,
        userId,
        action: 'arena_updated',
        entityType: 'arena',
        entityId: id,
        metadata: JSON.stringify({ title, description, status })
      }
    });

    // Broadcast via socket
    req.app.get('io')?.to(`arena:${id}`).emit('arena:updated', {
      arena: updatedArena
    });

    res.json({
      success: true,
      message: 'Arène mise à jour avec succès',
      data: { arena: updatedArena }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une arena
 */
export const deleteArena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que l'arène existe
    const arena = await prisma.arena.findUnique({
      where: { id }
    });

    if (!arena) {
      return res.status(404).json({
        success: false,
        message: 'Arène non trouvée'
      });
    }

    // Seul le propriétaire peut supprimer l'arène
    if (arena.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut supprimer l\'arène'
      });
    }

    // Supprimer l'arène (cascade supprimera battles, collaborations, etc.)
    await prisma.arena.delete({
      where: { id }
    });

    // Broadcast via socket
    req.app.get('io')?.to(`arena:${id}`).emit('arena:deleted', {
      arenaId: id
    });

    res.json({
      success: true,
      message: 'Arène supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};
