import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Settings, Swords, Trophy, LogOut } from 'lucide-react';
import { useArena } from '../contexts/ArenaContext';
import api from '../services/api';
import Layout from '../components/shared/Layout';
import BattleCard from '../components/arena/BattleCard';
import CreateBattleDialog from '../components/arena/CreateBattleDialog';
import ArenaShareDialog from '../components/arena/ArenaShareDialog';
import ArenaCollaboratorsList from '../components/arena/ArenaCollaboratorsList';
import { Button } from '../components/ui/Button';

export default function ArenaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedArena, setSelectedArena, removeArena } = useArena();

  // Charger l'arène avec React Query (cache automatique)
  const { data: arena, isLoading, error } = useQuery({
    queryKey: ['arena', id],
    queryFn: async () => {
      const response = await api.get(`/arenas/${id}`);
      return response.data.data.arena;
    },
  });

  // Synchroniser selectedArena avec le contexte
  useEffect(() => {
    if (arena) {
      setSelectedArena(arena);
    }
  }, [arena, setSelectedArena]);

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      console.error('Erreur chargement arène:', error);
      toast.error('Erreur lors du chargement de l\'arène');
    }
  }, [error]);

  // Extraire les battles de l'arène
  const battles = useMemo(() => arena?.battles || [], [arena]);

  const handleBattleCreated = (newBattle) => {
    // Mettre à jour le cache React Query
    queryClient.setQueryData(['arena', id], (old) =>
      old ? { ...old, battles: [newBattle, ...(old.battles || [])] } : old
    );
  };

  const handleLeaveArena = async () => {
    if (!confirm(`Quitter l'arène "${arena.title}" ?`)) return;

    try {
      await api.post(`/arena-collaboration/${id}/leave`);
      removeArena(id); // Retirer immédiatement de la sidebar
      toast.success('Vous avez quitté l\'arène');
      navigate('/arena');
    } catch (error) {
      console.error('Erreur en quittant l\'arène:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sortie');
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

  if (!arena) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Arène introuvable</h2>
          <p className="text-muted-foreground">Cette arène n'existe pas ou vous n'y avez pas accès.</p>
        </div>
      </Layout>
    );
  }

  const stats = {
    total: battles.length,
    active: battles.filter(b => b.status === 'active').length,
    completed: battles.filter(b => b.status === 'completed').length,
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          {/* Title and description */}
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-battle-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">{arena.title}</h1>
              {arena.description && (
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{arena.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Swords className="w-4 h-4" />
              <span>{stats.total} battle{stats.total > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{(arena._count?.collaborations || 0) + 1} membre{(arena._count?.collaborations || 0) + 1 > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <CreateBattleDialog arenaId={id} onBattleCreated={handleBattleCreated} />
            <ArenaShareDialog arenaId={id} isOwner={arena.role === 'owner'} />
            {arena.role !== 'owner' && (
              <Button
                variant="outline"
                onClick={handleLeaveArena}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Quitter</span>
                <span className="sm:hidden">Quitter</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Battles</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-battle-primary/10 rounded-lg flex items-center justify-center">
                <Swords className="w-6 h-6 text-battle-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-battle-warning">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-battle-warning/10 rounded-lg flex items-center justify-center">
                <Swords className="w-6 h-6 text-battle-warning" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold text-battle-secondary">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-battle-secondary/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-battle-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Battles Grid */}
        {battles.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Swords className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune battle dans cette arène
            </h3>
            <p className="text-muted-foreground mb-6">
              Lancez votre première battle dans cette arène collaborative !
            </p>
            <CreateBattleDialog arenaId={id} onBattleCreated={handleBattleCreated} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {battles.map((battle) => (
              <BattleCard key={battle.id} battle={battle} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
