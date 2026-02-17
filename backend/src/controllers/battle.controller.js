import { PrismaClient } from '@prisma/client';
import { calculateBattleScores } from '../utils/scoring.js';

const prisma = new PrismaClient();

/**
 * Get all battles pour l'utilisateur connecté (owned + collaborated)
 */
export const getBattles = async (req, res, next) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;

    // Battles dont l'utilisateur est propriétaire
    const ownedWhere = { userId };
    if (status) {
      ownedWhere.status = status;
    }

    const ownedBattles = await prisma.battle.findMany({
      where: ownedWhere,
      include: {
        fighters: {
          include: {
            arguments: true
          }
        }
      }
    });

    // Battles où l'utilisateur est collaborateur
    const collaborations = await prisma.collaboration.findMany({
      where: { userId },
      include: {
        battle: {
          include: {
            fighters: {
              include: {
                arguments: true
              }
            }
          }
        }
      }
    });

    const collaboratedBattles = collaborations
      .map(c => c.battle)
      .filter(b => !status || b.status === status);

    // Combiner et dédupliquer
    const allBattles = [...ownedBattles, ...collaboratedBattles];

    // Ajouter le nombre de collaborateurs pour chaque battle (+1 pour le propriétaire)
    const battlesWithCollabCount = await Promise.all(
      allBattles.map(async (battle) => {
        const collabCount = await prisma.collaboration.count({
          where: { battleId: battle.id }
        });
        return {
          ...battle,
          collaboratorsCount: collabCount + 1 // +1 pour le propriétaire
        };
      })
    );

    // Trier par date de mise à jour
    battlesWithCollabCount.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({
      success: true,
      data: { battles: battlesWithCollabCount }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get une battle spécifique avec tous ses fighters et arguments
 */
export const getBattle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer la battle
    const battle = await prisma.battle.findUnique({
      where: { id },
      include: {
        fighters: {
          include: {
            arguments: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    // Vérifier si l'utilisateur est propriétaire ou collaborateur
    const isOwner = battle.userId === userId;
    const collaboration = await prisma.collaboration.findUnique({
      where: {
        battleId_userId: {
          battleId: id,
          userId
        }
      }
    });

    // Vérifier si l'utilisateur est membre de l'arène contenant cette battle
    let isArenaMember = false;
    if (battle.arenaId) {
      const arenaCollaboration = await prisma.arenaCollaboration.findUnique({
        where: {
          arenaId_userId: {
            arenaId: battle.arenaId,
            userId
          }
        }
      });
      isArenaMember = !!arenaCollaboration;
    }

    if (!isOwner && !collaboration && !isArenaMember) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à cette battle'
      });
    }

    res.json({
      success: true,
      data: { battle }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une nouvelle battle
 */
export const createBattle = async (req, res, next) => {
  try {
    const { title, description, status = 'draft', arenaId } = req.body;
    const userId = req.user.id;

    const battle = await prisma.battle.create({
      data: {
        title,
        description,
        status,
        userId,
        arenaId: arenaId || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Battle créée avec succès',
      data: { battle }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une battle
 */
export const updateBattle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.id;

    // Récupérer la battle
    const existingBattle = await prisma.battle.findUnique({
      where: { id }
    });

    if (!existingBattle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    // Vérifier permissions (owner ou editor)
    const isOwner = existingBattle.userId === userId;
    const collaboration = await prisma.collaboration.findUnique({
      where: {
        battleId_userId: {
          battleId: id,
          userId
        }
      }
    });

    let isArenaMember = false;
    if (existingBattle.arenaId) {
      const arenaCollab = await prisma.arenaCollaboration.findUnique({
        where: { arenaId_userId: { arenaId: existingBattle.arenaId, userId } }
      });
      isArenaMember = !!arenaCollab;
    }

    const isEditor = (collaboration && (collaboration.role === 'editor' || collaboration.role === 'owner')) || isArenaMember;

    if (!isOwner && !isEditor) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes pour modifier cette battle'
      });
    }

    const battle = await prisma.battle.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status })
      }
    });

    res.json({
      success: true,
      message: 'Battle mise à jour avec succès',
      data: { battle }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une battle
 */
export const deleteBattle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que la battle appartient à l'utilisateur
    const battle = await prisma.battle.findFirst({
      where: { id, userId }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    await prisma.battle.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Battle supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recalculer les scores et obtenir le champion
 */
export const getChampion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que la battle appartient à l'utilisateur
    const battle = await prisma.battle.findFirst({
      where: { id, userId }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle non trouvée'
      });
    }

    // Recalculer les scores
    await calculateBattleScores(prisma, id);

    // Récupérer la battle mise à jour avec le champion
    const updatedBattle = await prisma.battle.findUnique({
      where: { id },
      include: {
        fighters: {
          include: {
            arguments: true
          }
        }
      }
    });

    const champion = updatedBattle.fighters.find(f => f.id === updatedBattle.championId);

    res.json({
      success: true,
      data: {
        champion,
        allFighters: updatedBattle.fighters
      }
    });
  } catch (error) {
    next(error);
  }
};
