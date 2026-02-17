import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { useRealtimeBattle } from '../hooks/useRealtimeBattle';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';
import { cn } from '../utils/cn';

export default function BattlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playVictory, playDelete } = useSound();
  const { isConnected, onlineUsers, emit } = useCollaboration();
  const [initialBattle, setInitialBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [hasPlayedVictory, setHasPlayedVictory] = useState(false);

  // Utiliser le hook de synchronisation temps réel
  const { battle, setBattle } = useRealtimeBattle(id, initialBattle);

  // Charger la battle initiale
  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const response = await api.get(`/battles/${id}`);
        const battleData = response.data.data.battle;
        setInitialBattle(battleData);
      } catch (error) {
        console.error('Erreur chargement battle:', error);
        toast.error('Battle non trouvée');
        navigate('/arena');
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();
  }, [id]);

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
    // Optimistic update
    setBattle(prev => prev ? { ...prev, title: newTitle } : null);
    // Émettre via socket (debounced)
    debouncedEmit('battle:update', {
      battleId: id,
      data: { title: newTitle }
    });
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    // Optimistic update
    setBattle(prev => prev ? { ...prev, description: newDescription } : null);
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

  if (loading) {
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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              to={battle?.arenaId ? `/arenas/${battle.arenaId}` : '/arena'}
              className="inline-flex items-center space-x-1 text-sm text-muted-foreground hover:text-battle-primary mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'arène</span>
            </Link>

            {/* Online indicator */}
            <OnlineIndicator isConnected={isConnected} onlineUsers={onlineUsers} />

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Input
                  value={battle?.title || ''}
                  onChange={handleTitleChange}
                  placeholder="Titre de la battle"
                  className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  maxLength={200}
                />
              </div>

              <textarea
                value={battle?.description || ''}
                onChange={handleDescriptionChange}
                placeholder="Description de la battle (optionnel)"
                className="w-full text-muted-foreground border-0 px-0 py-0 focus:outline-none focus:ring-0 resize-none"
                rows={2}
                maxLength={1000}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Boutons collaboration */}
            <ShareDialog battleId={id} />
            <CollaboratorsList battleId={id} />
            {battle.status === 'active' && (
              <Button
                variant="outline"
                onClick={handleCompleteBattle}
                className="border-battle-secondary text-battle-secondary hover:bg-battle-secondary hover:text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Terminer la battle
              </Button>
            )}
            {battle.status === 'completed' && (
              <div className="px-4 py-2 bg-battle-secondary/10 text-battle-secondary rounded-md text-sm font-medium">
                🏆 Battle terminée
              </div>
            )}
            {battle.userId !== user?.id && (
              <Button
                variant="outline"
                onClick={handleLeaveBattle}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Quitter
              </Button>
            )}
            {battle.userId === user?.id && (
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" />
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
              setBattle(prev => ({ ...prev, fighters: [...(prev.fighters || []), newFighter] }));
            }} />
        </div>

        {/* Fighters Grid */}
        {fighters.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground mb-4">
              Aucun fighter dans l'arène. Ajoutez votre premier fighter pour commencer la battle !
            </p>
            <AddFighterDialog battleId={id} onFighterAdded={(newFighter) => {
                setBattle(prev => ({ ...prev, fighters: [...(prev.fighters || []), newFighter] }));
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
                      setBattle(prev => ({
                        ...prev,
                        fighters: prev.fighters.map(f => f.id === updatedFighter.id ? updatedFighter : f)
                      }));
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
