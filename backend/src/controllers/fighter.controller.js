import { PrismaClient } from '@prisma/client';
import { calculateBattleScores } from '../utils/scoring.js';

const prisma = new PrismaClient();

/**
 * Get all fighters d'une battle
 */
export const getFighters = async (req, res, next) => {
  try {
    const { battleId } = req.params;
    const userId = req.user.id;

    // Vérifier que la battle appartient à l'utilisateur
    const battle = await prisma.battle.findFirst({
      where: {
        id: battleId,
        userId
      }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    const fighters = await prisma.fighter.findMany({
      where: { battleId },
      include: {
        arguments: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    res.json({
      success: true,
      data: { fighters }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get un fighter spécifique
 */
export const getFighter = async (req, res, next) => {
  try {
    const { battleId, id } = req.params;
    const userId = req.user.id;

    // Vérifier que la battle appartient à l'utilisateur
    const battle = await prisma.battle.findFirst({
      where: {
        id: battleId,
        userId
      }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    const fighter = await prisma.fighter.findFirst({
      where: {
        id,
        battleId
      },
      include: {
        arguments: true
      }
    });

    if (!fighter) {
      return res.status(404).json({
        success: false,
        message: 'Fighter non trouvé'
      });
    }

    res.json({
      success: true,
      data: { fighter }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouveau fighter
 */
export const createFighter = async (req, res, next) => {
  try {
    const { battleId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Vérifier que la battle existe
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    // Vérifier permissions (owner ou editor)
    const isOwner = battle.userId === userId;
    const collaboration = await prisma.collaboration.findUnique({
      where: {
        battleId_userId: {
          battleId,
          userId
        }
      }
    });

    let isArenaMember = false;
    if (battle.arenaId) {
      // Vérifier si owner de l'arène
      const arena = await prisma.arena.findUnique({
        where: { id: battle.arenaId }
      });
      const isArenaOwner = arena && arena.userId === userId;

      // Vérifier si collaborateur de l'arène
      const arenaCollab = await prisma.arenaCollaboration.findUnique({
        where: { arenaId_userId: { arenaId: battle.arenaId, userId } }
      });

      isArenaMember = isArenaOwner || (arenaCollab && arenaCollab.role === 'editor');
    }

    const isEditor = (collaboration && collaboration.role === 'editor') || isArenaMember;

    if (!isOwner && !isEditor) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes. Seuls les éditeurs peuvent ajouter des fighters.'
      });
    }

    // Calculer l'ordre automatiquement
    const lastFighter = await prisma.fighter.findFirst({
      where: { battleId },
      orderBy: { order: 'desc' }
    });

    const order = lastFighter ? lastFighter.order + 1 : 0;

    const fighter = await prisma.fighter.create({
      data: {
        name,
        description,
        order,
        battleId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Fighter ajouté avec succès',
      data: { fighter }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un fighter
 */
export const updateFighter = async (req, res, next) => {
  try {
    const { battleId, id } = req.params;
    const { name, description, order } = req.body;
    const userId = req.user.id;

    // Vérifier que la battle existe
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    // Vérifier permissions (owner ou editor)
    const isOwner = battle.userId === userId;
    const collaboration = await prisma.collaboration.findUnique({
      where: {
        battleId_userId: {
          battleId,
          userId
        }
      }
    });

    let isArenaMember = false;
    if (battle.arenaId) {
      // Vérifier si owner de l'arène
      const arena = await prisma.arena.findUnique({
        where: { id: battle.arenaId }
      });
      const isArenaOwner = arena && arena.userId === userId;

      // Vérifier si collaborateur de l'arène
      const arenaCollab = await prisma.arenaCollaboration.findUnique({
        where: { arenaId_userId: { arenaId: battle.arenaId, userId } }
      });

      isArenaMember = isArenaOwner || (arenaCollab && arenaCollab.role === 'editor');
    }

    const isEditor = (collaboration && collaboration.role === 'editor') || isArenaMember;

    if (!isOwner && !isEditor) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes. Seuls les éditeurs peuvent modifier des fighters.'
      });
    }

    // Vérifier que le fighter existe
    const existingFighter = await prisma.fighter.findFirst({
      where: { id, battleId }
    });

    if (!existingFighter) {
      return res.status(404).json({
        success: false,
        message: 'Fighter non trouvé'
      });
    }

    const fighter = await prisma.fighter.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order })
      }
    });

    res.json({
      success: true,
      message: 'Fighter mis à jour avec succès',
      data: { fighter }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un fighter
 */
export const deleteFighter = async (req, res, next) => {
  try {
    const { battleId, id } = req.params;
    const userId = req.user.id;

    // Vérifier que la battle existe
    const battle = await prisma.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    // Vérifier permissions (owner ou editor)
    const isOwner = battle.userId === userId;
    const collaboration = await prisma.collaboration.findUnique({
      where: {
        battleId_userId: {
          battleId,
          userId
        }
      }
    });

    let isArenaMember = false;
    if (battle.arenaId) {
      // Vérifier si owner de l'arène
      const arena = await prisma.arena.findUnique({
        where: { id: battle.arenaId }
      });
      const isArenaOwner = arena && arena.userId === userId;

      // Vérifier si collaborateur de l'arène
      const arenaCollab = await prisma.arenaCollaboration.findUnique({
        where: { arenaId_userId: { arenaId: battle.arenaId, userId } }
      });

      isArenaMember = isArenaOwner || (arenaCollab && arenaCollab.role === 'editor');
    }

    const isEditor = (collaboration && collaboration.role === 'editor') || isArenaMember;

    if (!isOwner && !isEditor) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes. Seuls les éditeurs peuvent supprimer des fighters.'
      });
    }

    // Vérifier que le fighter existe
    const fighter = await prisma.fighter.findFirst({
      where: { id, battleId }
    });

    if (!fighter) {
      return res.status(404).json({
        success: false,
        message: 'Fighter non trouvé'
      });
    }

    await prisma.fighter.delete({
      where: { id }
    });

    // Recalculer les scores de la battle
    await calculateBattleScores(prisma, battleId);

    res.json({
      success: true,
      message: 'Fighter supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};
