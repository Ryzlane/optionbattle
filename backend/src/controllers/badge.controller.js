import { getUserBadges, getAllBadgesWithStatus, checkAndUnlockBadges } from '../services/badgeService.js';

/**
 * Get badges débloqués de l'utilisateur
 */
export const getMyBadges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const badges = await getUserBadges(userId);

    res.json({
      success: true,
      data: { badges }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tous les badges avec statut (débloqué ou non)
 */
export const getAllBadges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const badges = await getAllBadgesWithStatus(userId);

    res.json({
      success: true,
      data: { badges }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Force la vérification et débloquage des badges
 */
export const checkBadges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newBadges = await checkAndUnlockBadges(userId);

    res.json({
      success: true,
      data: { newBadges }
    });
  } catch (error) {
    next(error);
  }
};
