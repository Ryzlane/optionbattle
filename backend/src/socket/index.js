import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { PrismaClient } from '@prisma/client';
import { calculateBattleScores } from '../utils/scoring.js';

const prisma = new PrismaClient();

/**
 * Configure et initialise Socket.io pour la collaboration temps réel
 */
export function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://your-domain.com'
        : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
      credentials: true
    }
  });

  // Middleware d'authentification Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Vérifier le token JWT
      const decoded = verifyToken(token);

      // Récupérer l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attacher l'utilisateur au socket
      socket.userId = user.id;
      socket.user = user;

      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.user.email} connected (${socket.id})`);

    // === EVENT: Rejoindre une battle room ===
    socket.on('battle:join', async ({ battleId }) => {
      try {
        // Vérifier l'accès à la battle
        const access = await checkBattleAccess(socket.userId, battleId);

        if (!access) {
          socket.emit('error', { message: 'Accès refusé à cette battle' });
          return;
        }

        // Rejoindre la room
        socket.join(`battle:${battleId}`);
        socket.currentBattle = battleId;

        // Mettre à jour lastSeenAt si collaborateur
        if (access.collaboration) {
          await prisma.collaboration.update({
            where: { id: access.collaboration.id },
            data: { lastSeenAt: new Date() }
          });
        }

        // Notifier les autres utilisateurs
        socket.to(`battle:${battleId}`).emit('user:joined', {
          user: socket.user,
          role: access.role
        });

        console.log(`User ${socket.user.email} joined battle:${battleId} as ${access.role}`);
      } catch (error) {
        console.error('Error joining battle:', error);
        socket.emit('error', { message: 'Erreur lors de la connexion à la battle' });
      }
    });

    // === EVENT: Quitter une battle room ===
    socket.on('battle:leave', ({ battleId }) => {
      socket.leave(`battle:${battleId}`);
      socket.to(`battle:${battleId}`).emit('user:left', {
        user: socket.user
      });

      if (socket.currentBattle === battleId) {
        socket.currentBattle = null;
      }

      console.log(`User ${socket.user.email} left battle:${battleId}`);
    });

    // === EVENTS BATTLE ===

    // Mise à jour battle (title, description, status)
    socket.on('battle:update', async ({ battleId, data }) => {
      try {
        const access = await checkBattleAccess(socket.userId, battleId, 'editor');
        if (!access) {
          return socket.emit('error', { message: 'Permissions insuffisantes' });
        }

        // Mise à jour en base de données
        const updateData = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status) updateData.status = data.status;

        const battle = await prisma.battle.update({
          where: { id: battleId },
          data: updateData
        });

        // Logger l'activité
        await logActivity(battleId, socket.userId, 'battle_updated', 'battle', battleId, data);

        // Broadcaster à tous sauf l'émetteur
        socket.to(`battle:${battleId}`).emit('battle:updated', {
          battle,
          updatedBy: socket.user
        });
      } catch (error) {
        console.error('Error updating battle:', error);
        socket.emit('error', { message: 'Erreur lors de la mise à jour de la battle' });
      }
    });

    // === EVENTS FIGHTER ===

    // Ajouter un fighter
    socket.on('fighter:add', async ({ battleId, fighter }) => {
      try {
        const access = await checkBattleAccess(socket.userId, battleId, 'editor');
        if (!access) {
          return socket.emit('error', { message: 'Permissions insuffisantes' });
        }

        // Compter les fighters existants pour l'ordre
        const count = await prisma.fighter.count({
          where: { battleId }
        });

        const newFighter = await prisma.fighter.create({
          data: {
            name: fighter.name,
            description: fighter.description,
            battleId,
            order: count
          },
          include: {
            arguments: true
          }
        });

        await logActivity(battleId, socket.userId, 'fighter_added', 'fighter', newFighter.id, {
          name: fighter.name
        });

        // Broadcaster à TOUS (y compris l'émetteur pour confirmation)
        io.to(`battle:${battleId}`).emit('fighter:added', {
          fighter: newFighter,
          addedBy: socket.user
        });
      } catch (error) {
        console.error('Error adding fighter:', error);
        socket.emit('error', { message: 'Erreur lors de l\'ajout du fighter' });
      }
    });

    // Mettre à jour un fighter
    socket.on('fighter:update', async ({ battleId, fighterId, data }) => {
      try {
        const access = await checkBattleAccess(socket.userId, battleId, 'editor');
        if (!access) {
          return socket.emit('error', { message: 'Permissions insuffisantes' });
        }

        const updateData = {};
        if (data.name) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.order !== undefined) updateData.order = data.order;

        const fighter = await prisma.fighter.update({
          where: { id: fighterId },
          data: updateData,
          include: {
            arguments: true
          }
        });

        await logActivity(battleId, socket.userId, 'fighter_updated', 'fighter', fighterId, data);

        socket.to(`battle:${battleId}`).emit('fighter:updated', {
          fighter,
          updatedBy: socket.user
        });
      } catch (error) {
        console.error('Error updating fighter:', error);
        socket.emit('error', { message: 'Erreur lors de la mise à jour du fighter' });
      }
    });

    // Supprimer un fighter
    socket.on('fighter:delete', async ({ battleId, fighterId }) => {
      try {
        const access = await checkBattleAccess(socket.userId, battleId, 'editor');
        if (!access) {
          return socket.emit('error', { message: 'Permissions insuffisantes' });
        }

        await prisma.fighter.delete({
          where: { id: fighterId }
        });

        // Recalculer les scores après suppression
        await calculateBattleScores(prisma, battleId);

        await logActivity(battleId, socket.userId, 'fighter_deleted', 'fighter', fighterId);

        io.to(`battle:${battleId}`).emit('fighter:deleted', {
          fighterId,
          deletedBy: socket.user
        });
      } catch (error) {
        console.error('Error deleting fighter:', error);
        socket.emit('error', { message: 'Erreur lors de la suppression du fighter' });
      }
    });

    // === EVENTS ARGUMENT ===

    // Ajouter un argument
    socket.on('argument:add', async ({ battleId, fighterId, argument }) => {
      try {
        const access = await checkBattleAccess(socket.userId, battleId, 'editor');
        if (!access) {
          return socket.emit('error', { message: 'Permissions insuffisantes' });
        }

        const newArgument = await prisma.argument.create({
          data: {
            text: argument.text,
            type: argument.type,
            weight: argument.weight,
            fighterId
          }
        });

        // Recalculer les scores
        await calculateBattleScores(prisma, battleId);

        // Récupérer la battle mise à jour avec tous les fighters et arguments
        const updatedBattle = await prisma.battle.findUnique({
          where: { id: battleId },
          include: {
            fighters: {
              include: {
                arguments: true
              }
            }
          }
        });

        await logActivity(battleId, socket.userId, 'argument_added', 'argument', newArgument.id, {
          type: argument.type,
          fighterId
        });

        io.to(`battle:${battleId}`).emit('argument:added', {
          argument: newArgument,
          fighterId,
          battle: updatedBattle,
          addedBy: socket.user
        });
      } catch (error) {
        console.error('Error adding argument:', error);
        socket.emit('error', { message: 'Erreur lors de l\'ajout de l\'argument' });
      }
    });

    // Mettre à jour un argument
    socket.on('argument:update', async ({ battleId, argumentId, data }) => {
      try {
        const access = await checkBattleAccess(socket.userId, battleId, 'editor');
        if (!access) {
          return socket.emit('error', { message: 'Permissions insuffisantes' });
        }

        const updateData = {};
        if (data.text) updateData.text = data.text;
        if (data.weight !== undefined) updateData.weight = data.weight;

        const argument = await prisma.argument.update({
          where: { id: argumentId },
          data: updateData
        });

        // Recalculer les scores
        await calculateBattleScores(prisma, battleId);

        const updatedBattle = await prisma.battle.findUnique({
          where: { id: battleId },
          include: {
            fighters: {
              include: {
                arguments: true
              }
            }
          }
        });

        await logActivity(battleId, socket.userId, 'argument_updated', 'argument', argumentId, data);

        socket.to(`battle:${battleId}`).emit('argument:updated', {
          argument,
          battle: updatedBattle,
          updatedBy: socket.user
        });
      } catch (error) {
        console.error('Error updating argument:', error);
        socket.emit('error', { message: 'Erreur lors de la mise à jour de l\'argument' });
      }
    });

    // Supprimer un argument
    socket.on('argument:delete', async ({ battleId, argumentId }) => {
      try {
        const access = await checkBattleAccess(socket.userId, battleId, 'editor');
        if (!access) {
          return socket.emit('error', { message: 'Permissions insuffisantes' });
        }

        await prisma.argument.delete({
          where: { id: argumentId }
        });

        // Recalculer les scores
        await calculateBattleScores(prisma, battleId);

        const updatedBattle = await prisma.battle.findUnique({
          where: { id: battleId },
          include: {
            fighters: {
              include: {
                arguments: true
              }
            }
          }
        });

        await logActivity(battleId, socket.userId, 'argument_deleted', 'argument', argumentId);

        io.to(`battle:${battleId}`).emit('argument:deleted', {
          argumentId,
          battle: updatedBattle,
          deletedBy: socket.user
        });
      } catch (error) {
        console.error('Error deleting argument:', error);
        socket.emit('error', { message: 'Erreur lors de la suppression de l\'argument' });
      }
    });

    // === EVENT: Déconnexion ===
    socket.on('disconnect', () => {
      if (socket.currentBattle) {
        socket.to(socket.currentBattle).emit('user:left', {
          user: socket.user
        });
      }
      console.log(`❌ User ${socket.user.email} disconnected`);
    });
  });

  console.log('🔌 Socket.io configured and ready');
  return io;
}

// === HELPER FUNCTIONS ===

/**
 * Vérifier l'accès d'un utilisateur à une battle
 */
async function checkBattleAccess(userId, battleId, requiredRole = null) {
  const battle = await prisma.battle.findUnique({
    where: { id: battleId }
  });

  if (!battle) return null;

  // Owner a tous les droits
  if (battle.userId === userId) {
    return { role: 'owner', battle };
  }

  // Vérifier collaboration
  const collaboration = await prisma.collaboration.findUnique({
    where: {
      battleId_userId: {
        battleId,
        userId
      }
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

/**
 * Logger une activité dans la base de données
 */
async function logActivity(battleId, userId, action, entityType, entityId, metadata = null) {
  try {
    await prisma.activity.create({
      data: {
        battleId,
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
