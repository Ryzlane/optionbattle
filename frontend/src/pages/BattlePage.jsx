import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Save, Trophy, Loader2, CheckCircle, LogOut } from 'lucide-react';
import debounce from 'lodash.debounce';
import api from '../services/api';
import Layout from '../components/shared/Layout';
import FighterCard from '../components/battle/FighterCard';
import AddFighterDialog from '../components/battle/AddFighterDialog';
import ShareDialog from '../components/collaboration/ShareDialog';
import CollaboratorsList from '../components/collaboration/CollaboratorsList';
import OnlineIndicator from '../components/collaboration/OnlineIndicator';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useRealtimeBattleSync } from '../hooks/useRealtimeBattleSync';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';
import { cn } from '../utils/cn';

export default function BattlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { playVictory, playDelete } = useSound();
  const { isConnected, onlineUsers, emit } = useCollaboration();
  const [deleting, setDeleting] = useState(false);
  const [hasPlayedVictory, setHasPlayedVictory] = useState(false);

  // Charger la battle avec React Query (cache automatique)
  const { data: battle, isLoading, error } = useQuery({
    queryKey: ['battle', id],
    queryFn: async () => {
      const response = await api.get(`/battles/${id}`);
      return response.data.data.battle;
    },
  });

  // Synchroniser avec WebSocket (met à jour le cache React Query)
  useRealtimeBattleSync(id);

  // Gérer les erreurs de chargement
  useEffect(() => {
    if (error) {
      console.error('Erreur chargement battle:', error);
      toast.error('Battle non trouvée');
      navigate('/arena');
    }
  }, [error, navigate]);

  // Play victory sound when champion appears
  useEffect(() => {
    if (battle?.championId && !hasPlayedVictory) {
      playVictory();
      setHasPlayedVictory(true);
    } else if (!battle?.championId) {
      setHasPlayedVictory(false);
    }
  }, [battle?.championId]);

  // Debounced emit pour modifications temps réel
  const debouncedEmit = useRef(
    debounce((event, data) => {
      emit(event, data);
    }, 1000)
  ).current;

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    // Optimistic update du cache React Query
    queryClient.setQueryData(['battle', id], (old) =>
      old ? { ...old, title: newTitle } : old
    );
    // Émettre via socket (debounced)
    debouncedEmit('battle:update', {
      battleId: id,
      data: { title: newTitle }
    });
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    // Optimistic update du cache React Query
    queryClient.setQueryData(['battle', id], (old) =>
      old ? { ...old, description: newDescription } : old
    );
    // Émettre via socket (debounced)
    debouncedEmit('battle:update', {
      battleId: id,
      data: { description: newDescription }
    });
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer la battle "${battle.title}" définitivement ?`)) return;

    playDelete();
    setDeleting(true);
    try {
      await api.delete(`/battles/${id}`);
      toast.success('Battle supprimée');
      navigate('/arena');
    } catch (error) {
      console.error('Erreur suppression battle:', error);
      toast.error('Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  const handleLeaveBattle = async () => {
    if (!confirm(`Quitter la battle "${battle.title}" ?`)) return;

    try {
      await api.post(`/collaboration/${id}/leave`);
      toast.success('Vous avez quitté la battle');
      navigate('/arena');
    } catch (error) {
      console.error('Erreur en quittant la battle:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sortie');
    }
  };

  // Plus besoin de ces callbacks - useRealtimeBattle gère la synchronisation
  // Les events socket mettent automatiquement à jour la battle

  const handleCompleteBattle = async () => {
    if (!confirm(`Marquer "${battle.title}" comme terminée ? Vous pourrez toujours la rouvrir plus tard.`)) return;

    try {
      await api.put(`/battles/${id}`, { status: 'completed' });
      playVictory(); // Son de victoire
      toast.success('Battle terminée ! 🏆');

      // Redirection vers le dashboard après 1 seconde
      setTimeout(() => {
        navigate('/arena');
      }, 1000);
    } catch (error) {
      console.error('Erreur complétion battle:', error);
      toast.error('Erreur lors de la complétion de la battle');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-battle-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!battle) {
    return null;
  }

  const fighters = battle.fighters || [];
  const championFighter = fighters.find(f => f.id === battle.championId);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Back button and status */}
          <div className="flex items-center justify-between">
            <Link
              to={battle?.arenaId ? `/arenas/${battle.arenaId}` : '/arena'}
              className="inline-flex items-center space-x-1 text-sm text-muted-foreground hover:text-battle-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'arène</span>
            </Link>

            {/* Online indicator */}
            <OnlineIndicator isConnected={isConnected} onlineUsers={onlineUsers} />
          </div>

          {/* Title and description */}
          <div className="space-y-3">
            <Input
              value={battle?.title || ''}
              onChange={handleTitleChange}
              placeholder="Titre de la battle"
              className="text-xl sm:text-2xl font-bold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              maxLength={200}
            />

            <textarea
              value={battle?.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Description de la battle (optionnel)"
              className="w-full text-sm sm:text-base text-muted-foreground border-0 px-0 py-0 focus:outline-none focus:ring-0 resize-none"
              rows={2}
              maxLength={1000}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <ShareDialog battleId={id} />
            <CollaboratorsList battleId={id} />

            {battle.status === 'completed' && (
              <div className="px-3 py-1.5 bg-battle-secondary/10 text-battle-secondary rounded-md text-sm font-medium">
                <Trophy className="w-4 h-4 inline mr-1" />
                Battle terminée
              </div>
            )}

            {battle.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompleteBattle}
                className="border-battle-secondary text-battle-secondary hover:bg-battle-secondary hover:text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Terminer la battle</span>
                <span className="sm:hidden">Terminer</span>
              </Button>
            )}

            {battle.userId !== user?.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeaveBattle}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Quitter
              </Button>
            )}

            {battle.userId === user?.id && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Supprimer</span>
              </Button>
            )}
          </div>
        </div>

        {/* Champion Banner */}
        {championFighter && (
          <div className="bg-gradient-to-r from-battle-combat/10 to-battle-combat/5 border border-battle-combat/20 rounded-lg p-6 animate-bounce-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-battle-combat rounded-full">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-battle-combat">Champion actuel</p>
                  <p className="text-xl font-bold text-slate-900">{championFighter.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Combat Score</p>
                <p className="text-3xl font-bold text-battle-combat">
                  {championFighter.score > 0 ? '+' : ''}{championFighter.score}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Fighters ({fighters.length})
          </h2>
          <AddFighterDialog battleId={id} onFighterAdded={(newFighter) => {
              queryClient.setQueryData(['battle', id], (old) =>
                old ? { ...old, fighters: [...(old.fighters || []), newFighter] } : old
              );
            }} />
        </div>

        {/* Fighters Grid */}
        {fighters.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground mb-4">
              Aucun fighter dans l'arène. Ajoutez votre premier fighter pour commencer la battle !
            </p>
            <AddFighterDialog battleId={id} onFighterAdded={(newFighter) => {
                queryClient.setQueryData(['battle', id], (old) =>
                  old ? { ...old, fighters: [...(old.fighters || []), newFighter] } : old
                );
              }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fighters
              .sort((a, b) => (b.score || 0) - (a.score || 0)) // Tri par score décroissant
              .map((fighter) => (
                <FighterCard
                  key={fighter.id}
                  battleId={id}
                  fighter={fighter}
                  isChampion={fighter.id === battle.championId}
                  onFighterUpdated={(updatedFighter) => {
                    if (updatedFighter) {
                      queryClient.setQueryData(['battle', id], (old) =>
                        old ? {
                          ...old,
                          fighters: old.fighters.map(f => f.id === updatedFighter.id ? updatedFighter : f)
                        } : old
                      );
                    }
                  }}
                />
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
