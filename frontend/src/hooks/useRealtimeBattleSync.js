import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCollaboration } from '../contexts/CollaborationContext';
import { toast } from 'sonner';

/**
 * Hook pour synchroniser le cache React Query d'une battle avec les événements WebSocket
 *
 * @param {string} battleId - ID de la battle à synchroniser
 */
export function useRealtimeBattleSync(battleId) {
  const queryClient = useQueryClient();
  const { isConnected, joinBattle, leaveBattle, on, off } = useCollaboration();

  useEffect(() => {
    if (!battleId || !isConnected) return;

    // Rejoindre la battle room
    joinBattle(battleId);

    // === LISTENERS POUR EVENTS TEMPS RÉEL ===
    // Tous les événements mettent à jour le cache React Query directement

    // Battle updated (title, description, status)
    on('battle:updated', ({ battle: updatedBattle, updatedBy }) => {
      queryClient.setQueryData(['battle', battleId], (old) => {
        if (!old) return old;
        return {
          ...old,
          title: updatedBattle.title !== undefined ? updatedBattle.title : old.title,
          description: updatedBattle.description !== undefined ? updatedBattle.description : old.description,
          status: updatedBattle.status !== undefined ? updatedBattle.status : old.status,
          championId: updatedBattle.championId !== undefined ? updatedBattle.championId : old.championId,
          updatedAt: updatedBattle.updatedAt || old.updatedAt
        };
      });

      toast.info(`${updatedBy.name || updatedBy.email} a modifié la battle`, {
        duration: 2000
      });
    });

    // Fighter added
    on('fighter:added', ({ fighter, addedBy }) => {
      queryClient.setQueryData(['battle', battleId], (old) => {
        if (!old) return old;

        // Vérifier que le fighter n'est pas déjà présent
        if (old.fighters?.find(f => f.id === fighter.id)) {
          return old;
        }

        return {
          ...old,
          fighters: [...(old.fighters || []), fighter]
        };
      });

      toast.success(`${addedBy.name || addedBy.email} a ajouté "${fighter.name}"`, {
        duration: 2000
      });
    });

    // Fighter updated
    on('fighter:updated', ({ fighter, updatedBy }) => {
      queryClient.setQueryData(['battle', battleId], (old) => {
        if (!old) return old;

        return {
          ...old,
          fighters: old.fighters.map(f => f.id === fighter.id ? fighter : f)
        };
      });

      toast.info(`${updatedBy.name || updatedBy.email} a modifié "${fighter.name}"`, {
        duration: 2000
      });
    });

    // Fighter deleted
    on('fighter:deleted', ({ fighterId, deletedBy }) => {
      queryClient.setQueryData(['battle', battleId], (old) => {
        if (!old) return old;

        return {
          ...old,
          fighters: old.fighters.filter(f => f.id !== fighterId)
        };
      });

      toast.warning(`${deletedBy.name || deletedBy.email} a supprimé un fighter`, {
        duration: 2000
      });
    });

    // Argument added (full battle update pour scores recalculés)
    on('argument:added', ({ battle: updatedBattle, addedBy }) => {
      queryClient.setQueryData(['battle', battleId], updatedBattle);

      toast.info(`${addedBy.name || addedBy.email} a ajouté un argument`, {
        duration: 2000
      });
    });

    // Argument updated (full battle update pour scores recalculés)
    on('argument:updated', ({ battle: updatedBattle, updatedBy }) => {
      queryClient.setQueryData(['battle', battleId], updatedBattle);

      toast.info(`${updatedBy.name || updatedBy.email} a modifié un argument`, {
        duration: 2000
      });
    });

    // Argument deleted (full battle update pour scores recalculés)
    on('argument:deleted', ({ battle: updatedBattle, deletedBy }) => {
      queryClient.setQueryData(['battle', battleId], updatedBattle);

      toast.info(`${deletedBy.name || deletedBy.email} a supprimé un argument`, {
        duration: 2000
      });
    });

    // Collaborator removed - Si c'est moi, rediriger
    on('collaborator:removed', ({ userId }) => {
      const currentUserId = localStorage.getItem('userId');

      if (userId === currentUserId) {
        toast.error('Vous avez été retiré de cette battle', {
          duration: 3000
        });

        // Redirection après 2 secondes
        setTimeout(() => {
          window.location.href = '/arena';
        }, 2000);
      }
    });

    // Cleanup au démontage
    return () => {
      off('battle:updated');
      off('fighter:added');
      off('fighter:updated');
      off('fighter:deleted');
      off('argument:added');
      off('argument:updated');
      off('argument:deleted');
      off('collaborator:removed');

      leaveBattle(battleId);
    };
  }, [battleId, isConnected, queryClient]);
}
