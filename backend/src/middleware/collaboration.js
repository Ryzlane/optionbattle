import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware pour vérifier l'accès à une battle (ownership ou collaboration)
 * À utiliser après le middleware protect() qui injecte req.user
 *
 * @param {string} requiredRole - Rôle minimum requis (null, 'viewer', 'editor', 'owner')
 * @returns {Function} Express middleware
 */
export const checkBattleAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const battleId = req.params.battleId || req.params.id;
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

      // Owner a tous les droits (bypass)
      if (battle.userId === userId) {
        req.battleAccess = { role: 'owner', battle };
        return next();
      }

      // Vérifier si l'utilisateur est collaborateur direct de la battle
      const collaboration = await prisma.collaboration.findUnique({
        where: {
          battleId_userId: {
            battleId,
            userId
          }
        }
      });

      if (collaboration) {
        // Vérifier le rôle requis
        if (requiredRole) {
          const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
          if (roleHierarchy[collaboration.role] < roleHierarchy[requiredRole]) {
            return res.status(403).json({
              success: false,
              message: 'Permissions insuffisantes pour cette action'
            });
          }
        }
        req.battleAccess = { role: collaboration.role, collaboration };
        return next();
      }

      // Vérifier si membre de l'arène contenant cette battle
      if (battle.arenaId) {
        const arenaCollab = await prisma.arenaCollaboration.findUnique({
          where: { arenaId_userId: { arenaId: battle.arenaId, userId } }
        });
        if (arenaCollab) {
          if (requiredRole) {
            const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
            if (roleHierarchy[arenaCollab.role] < roleHierarchy[requiredRole]) {
              return res.status(403).json({
                success: false,
                message: 'Permissions insuffisantes pour cette action'
              });
            }
          }
          req.battleAccess = { role: arenaCollab.role, arenaCollab };
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Accès refusé à cette battle'
      });
    } catch (error) {
      next(error);
    }
  };
};
