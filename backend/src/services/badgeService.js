import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Définition des badges disponibles
 */
export const BADGES = {
  FIRST_BLOOD: {
    type: 'first-blood',
    name: 'First Blood',
    description: 'Créer ta première battle',
    icon: '⚔️',
    checkCondition: async (userId) => {
      const count = await prisma.battle.count({ where: { userId } });
      return count >= 1;
    }
  },
  VETERAN: {
    type: 'veteran',
    name: 'Veteran',
    description: 'Créer 10 battles',
    icon: '🎖️',
    checkCondition: async (userId) => {
      const count = await prisma.battle.count({ where: { userId } });
      return count >= 10;
    }
  },
  CHAMPION: {
    type: 'champion',
    name: 'Champion',
    description: 'Terminer 5 battles',
    icon: '🏆',
    checkCondition: async (userId) => {
      const count = await prisma.battle.count({
        where: { userId, status: 'completed' }
      });
      return count >= 5;
    }
  },
  ANALYST: {
    type: 'analyst',
    name: 'Analyst',
    description: 'Créer une battle avec 5+ fighters',
    icon: '🧠',
    checkCondition: async (userId) => {
      const battles = await prisma.battle.findMany({
        where: { userId },
        include: { fighters: true }
      });
      return battles.some(b => b.fighters.length >= 5);
    }
  },
  WISE: {
    type: 'wise',
    name: 'Wise',
    description: 'Ajouter 20+ arguments au total',
    icon: '🦉',
    checkCondition: async (userId) => {
      const battles = await prisma.battle.findMany({
        where: { userId },
        include: {
          fighters: {
            include: { arguments: true }
          }
        }
      });

      const totalArgs = battles.reduce((sum, battle) => {
        return sum + battle.fighters.reduce((fSum, fighter) => {
          return fSum + fighter.arguments.length;
        }, 0);
      }, 0);

      return totalArgs >= 20;
    }
  },
};

/**
 * Vérifie et débloque les badges pour un utilisateur
 * Retourne les nouveaux badges débloqués
 */
export const checkAndUnlockBadges = async (userId) => {
  const newBadges = [];

  // Récupérer les badges déjà débloqués
  const unlockedBadges = await prisma.badge.findMany({
    where: { userId }
  });
  const unlockedTypes = unlockedBadges.map(b => b.badgeType);

  // Vérifier chaque badge
  for (const [key, badge] of Object.entries(BADGES)) {
    // Skip si déjà débloqué
    if (unlockedTypes.includes(badge.type)) {
      continue;
    }

    // Vérifier la condition
    const unlocked = await badge.checkCondition(userId);

    if (unlocked) {
      // Débloquer le badge
      const newBadge = await prisma.badge.create({
        data: {
          userId,
          badgeType: badge.type
        }
      });

      newBadges.push({
        ...newBadge,
        name: badge.name,
        description: badge.description,
        icon: badge.icon
      });
    }
  }

  return newBadges;
};

/**
 * Récupère tous les badges d'un utilisateur avec les infos
 */
export const getUserBadges = async (userId) => {
  const unlockedBadges = await prisma.badge.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' }
  });

  return unlockedBadges.map(badge => {
    const badgeInfo = Object.values(BADGES).find(b => b.type === badge.badgeType);
    return {
      ...badge,
      name: badgeInfo?.name || 'Unknown',
      description: badgeInfo?.description || '',
      icon: badgeInfo?.icon || '🏅'
    };
  });
};

/**
 * Récupère tous les badges disponibles avec statut unlocked
 */
export const getAllBadgesWithStatus = async (userId) => {
  const unlockedBadges = await prisma.badge.findMany({
    where: { userId }
  });
  const unlockedTypes = unlockedBadges.map(b => b.badgeType);

  return Object.values(BADGES).map(badge => ({
    type: badge.type,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    unlocked: unlockedTypes.includes(badge.type),
    unlockedAt: unlockedBadges.find(b => b.badgeType === badge.type)?.unlockedAt || null
  }));
};
