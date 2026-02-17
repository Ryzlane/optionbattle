import { PrismaClient } from '@prisma/client';
import { calculateBattleScores } from '../utils/scoring.js';

const prisma = new PrismaClient();

/**
 * Get all arguments d'un fighter
 */
export const getArguments = async (req, res, next) => {
  try {
    const { battleId, fighterId } = req.params;
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

    // Vérifier que le fighter existe
    const fighter = await prisma.fighter.findFirst({
      where: {
        id: fighterId,
        battleId
      }
    });

    if (!fighter) {
      return res.status(404).json({
        success: false,
        message: 'Fighter non trouvé'
      });
    }

    const argumentsList = await prisma.argument.findMany({
      where: { fighterId },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({
      success: true,
      data: { arguments: argumentsList }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get un argument spécifique
 */
export const getArgument = async (req, res, next) => {
  try {
    const { battleId, fighterId, id } = req.params;
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

    const argument = await prisma.argument.findFirst({
      where: {
        id,
        fighterId
      }
    });

    if (!argument) {
      return res.status(404).json({
        success: false,
        message: 'Argument non trouvé'
      });
    }

    res.json({
      success: true,
      data: { argument }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouvel argument (power ou weakness)
 */
export const createArgument = async (req, res, next) => {
  try {
    const { battleId, fighterId } = req.params;
    const { text, type, weight = 3 } = req.body;
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
      const arenaCollab = await prisma.arenaCollaboration.findUnique({
        where: { arenaId_userId: { arenaId: battle.arenaId, userId } }
      });
      isArenaMember = !!arenaCollab;
    }

    const isEditor = (collaboration && collaboration.role === 'editor') || isArenaMember;

    if (!isOwner && !isEditor) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes. Seuls les éditeurs peuvent ajouter des arguments.'
      });
    }

    // Vérifier que le fighter existe
    const fighter = await prisma.fighter.findFirst({
      where: {
        id: fighterId,
        battleId
      }
    });

    if (!fighter) {
      return res.status(404).json({
        success: false,
        message: 'Fighter non trouvé'
      });
    }

    const argument = await prisma.argument.create({
      data: {
        text,
        type,
        weight,
        fighterId
      }
    });

    // Recalculer les scores de la battle
    await calculateBattleScores(prisma, battleId);

    res.status(201).json({
      success: true,
      message: `${type === 'power' ? 'Attack Power' : 'Weakness'} ajouté avec succès`,
      data: { argument }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un argument
 */
export const updateArgument = async (req, res, next) => {
  try {
    const { battleId, fighterId, id } = req.params;
    const { text, type, weight } = req.body;
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
      const arenaCollab = await prisma.arenaCollaboration.findUnique({
        where: { arenaId_userId: { arenaId: battle.arenaId, userId } }
      });
      isArenaMember = !!arenaCollab;
    }

    const isEditor = (collaboration && collaboration.role === 'editor') || isArenaMember;

    if (!isOwner && !isEditor) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes. Seuls les éditeurs peuvent modifier des arguments.'
      });
    }

    // Vérifier que l'argument existe
    const existingArgument = await prisma.argument.findFirst({
      where: { id, fighterId }
    });

    if (!existingArgument) {
      return res.status(404).json({
        success: false,
        message: 'Argument non trouvé'
      });
    }

    const argument = await prisma.argument.update({
      where: { id },
      data: {
        ...(text && { text }),
        ...(type && { type }),
        ...(weight !== undefined && { weight })
      }
    });

    // Recalculer les scores de la battle
    await calculateBattleScores(prisma, battleId);

    res.json({
      success: true,
      message: 'Argument mis à jour avec succès',
      data: { argument }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un argument
 */
export const deleteArgument = async (req, res, next) => {
  try {
    const { battleId, fighterId, id } = req.params;
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
      const arenaCollab = await prisma.arenaCollaboration.findUnique({
        where: { arenaId_userId: { arenaId: battle.arenaId, userId } }
      });
      isArenaMember = !!arenaCollab;
    }

    const isEditor = (collaboration && collaboration.role === 'editor') || isArenaMember;

    if (!isOwner && !isEditor) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes. Seuls les éditeurs peuvent supprimer des arguments.'
      });
    }

    // Vérifier que l'argument existe
    const argument = await prisma.argument.findFirst({
      where: { id, fighterId }
    });

    if (!argument) {
      return res.status(404).json({
        success: false,
        message: 'Argument non trouvé'
      });
    }

    await prisma.argument.delete({
      where: { id }
    });

    // Recalculer les scores de la battle
    await calculateBattleScores(prisma, battleId);

    res.json({
      success: true,
      message: 'Argument supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};
