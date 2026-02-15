import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, Settings, Swords, Trophy } from 'lucide-react';
import { useArena } from '../contexts/ArenaContext';
import api from '../services/api';
import Layout from '../components/shared/Layout';
import BattleCard from '../components/arena/BattleCard';
import CreateBattleDialog from '../components/arena/CreateBattleDialog';
import { Button } from '../components/ui/Button';

export default function ArenaPage() {
  const { id } = useParams();
  const { selectedArena, setSelectedArena } = useArena();
  const [arena, setArena] = useState(null);
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArena = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/arenas/${id}`);
        const arenaData = response.data.data.arena;
        setArena(arenaData);
        setSelectedArena(arenaData);
        setBattles(arenaData.battles || []);
      } catch (error) {
        console.error('Erreur chargement arène:', error);
        toast.error('Erreur lors du chargement de l\'arène');
      } finally {
        setLoading(false);
      }
    };

    fetchArena();
  }, [id, setSelectedArena]);

  const handleBattleCreated = (newBattle) => {
    setBattles((prev) => [newBattle, ...prev]);
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-battle-primary rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{arena.title}</h1>
                {arena.description && (
                  <p className="text-muted-foreground mt-1">{arena.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground ml-15">
              <div className="flex items-center space-x-1">
                <Swords className="w-4 h-4" />
                <span>{stats.total} battle{stats.total > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{arena._count?.collaborations || 0} membre{arena._count?.collaborations > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CreateBattleDialog arenaId={id} onBattleCreated={handleBattleCreated} />
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
