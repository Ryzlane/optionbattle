import { useEffect, useState } from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { toast } from 'sonner';

/**
 * Hook pour synchroniser une battle en temps réel via Socket.io
 *
 * @param {string} battleId - ID de la battle à synchroniser
 * @param {Object} initialBattle - Battle initiale chargée depuis l'API
 * @returns {Object} { battle, setBattle } - État de la battle synchronisé
 */
export function useRealtimeBattle(battleId, initialBattle) {
  const { isConnected, joinBattle, leaveBattle, on, off } = useCollaboration();
  const [battle, setBattle] = useState(initialBattle);

  useEffect(() => {
    if (!battleId || !isConnected) return;

    // Rejoindre la battle room
    joinBattle(battleId);

    // === LISTENERS POUR EVENTS TEMPS RÉEL ===

    // Battle updated (title, description, status)
    on('battle:updated', ({ battle: updatedBattle, updatedBy }) => {
      setBattle(prev => ({
        ...prev,
        title: updatedBattle.title !== undefined ? updatedBattle.title : prev.title,
        description: updatedBattle.description !== undefined ? updatedBattle.description : prev.description,
        status: updatedBattle.status !== undefined ? updatedBattle.status : prev.status,
        championId: updatedBattle.championId !== undefined ? updatedBattle.championId : prev.championId,
        updatedAt: updatedBattle.updatedAt || prev.updatedAt
      }));

      toast.info(`${updatedBy.name || updatedBy.email} a modifié la battle`, {
        duration: 2000
      });
    });

    // Fighter added
    on('fighter:added', ({ fighter, addedBy }) => {
      setBattle(prev => {
        // Vérifier que le fighter n'est pas déjà présent
        if (prev.fighters?.find(f => f.id === fighter.id)) {
          return prev;
        }

        return {
          ...prev,
          fighters: [...(prev.fighters || []), fighter]
        };
      });

      toast.success(`${addedBy.name || addedBy.email} a ajouté "${fighter.name}"`, {
        duration: 2000
      });
    });

    // Fighter updated
    on('fighter:updated', ({ fighter, updatedBy }) => {
      setBattle(prev => ({
        ...prev,
        fighters: prev.fighters.map(f => f.id === fighter.id ? fighter : f)
      }));

      toast.info(`${updatedBy.name || updatedBy.email} a modifié "${fighter.name}"`, {
        duration: 2000
      });
    });

    // Fighter deleted
    on('fighter:deleted', ({ fighterId, deletedBy }) => {
      setBattle(prev => ({
        ...prev,
        fighters: prev.fighters.filter(f => f.id !== fighterId)
      }));

      toast.warning(`${deletedBy.name || deletedBy.email} a supprimé un fighter`, {
        duration: 2000
      });
    });

    // Argument added (full battle update pour scores recalculés)
    on('argument:added', ({ battle: updatedBattle, addedBy }) => {
      setBattle(updatedBattle);

      toast.info(`${addedBy.name || addedBy.email} a ajouté un argument`, {
        duration: 2000
      });
    });

    // Argument updated (full battle update pour scores recalculés)
    on('argument:updated', ({ battle: updatedBattle, updatedBy }) => {
      setBattle(updatedBattle);

      toast.info(`${updatedBy.name || updatedBy.email} a modifié un argument`, {
        duration: 2000
      });
    });

    // Argument deleted (full battle update pour scores recalculés)
    on('argument:deleted', ({ battle: updatedBattle, deletedBy }) => {
      setBattle(updatedBattle);

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
  }, [battleId, isConnected]);

  // Sync initial battle quand elle change
  useEffect(() => {
    if (initialBattle) {
      setBattle(initialBattle);
    }
  }, [initialBattle]);

  return {
    battle,
    setBattle
  };
}
