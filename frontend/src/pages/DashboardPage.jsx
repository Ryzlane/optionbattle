import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Swords, Filter, TrendingUp, Trophy, Zap } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/shared/Layout';
import CreateBattleDialog from '../components/arena/CreateBattleDialog';
import QuickBattleDialog from '../components/templates/QuickBattleDialog';
import BattleCard from '../components/arena/BattleCard';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

export default function DashboardPage() {
  const [filterStatus, setFilterStatus] = useState('all');

  // Charger toutes les battles avec React Query (1 seul appel API)
  const { data: allBattles = [], isLoading, refetch } = useQuery({
    queryKey: ['battles'],
    queryFn: async () => {
      const response = await api.get('/battles');
      return response.data.data.battles;
    },
  });

  // Filtrer côté client : battles personnelles (sans arenaId)
  const personalBattles = useMemo(() =>
    allBattles.filter(b => !b.arenaId),
    [allBattles]
  );

  // Filtrer par status
  const battles = useMemo(() => {
    if (filterStatus === 'all') return personalBattles;
    return personalBattles.filter(b => b.status === filterStatus);
  }, [personalBattles, filterStatus]);

  const filters = [
    { value: 'all', label: 'Toutes', icon: Zap },
    { value: 'active', label: 'En cours', icon: Swords },
    { value: 'completed', label: 'Terminées', icon: Trophy },
  ];

  // Calculer les stats sur les battles personnelles
  const stats = useMemo(() => ({
    total: personalBattles.length,
    active: personalBattles.filter(b => b.status === 'active').length,
    completed: personalBattles.filter(b => b.status === 'completed').length,
  }), [personalBattles]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
              <div className="w-10 h-10 bg-battle-primary rounded-lg flex items-center justify-center">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <span>Battles Personnelles</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos battles personnelles et laissez vos options combattre
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <QuickBattleDialog onBattleCreated={refetch} />
            <CreateBattleDialog onBattleCreated={refetch} />
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
                <Zap className="w-6 h-6 text-battle-primary" />
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

        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.value}
                variant={filterStatus === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(filter.value)}
                className="whitespace-nowrap"
              >
                <Icon className="w-4 h-4 mr-2" />
                {filter.label}
              </Button>
            );
          })}
        </div>

        {/* Battles Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-battle-primary border-t-transparent rounded-full"></div>
          </div>
        ) : battles.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Swords className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {filterStatus === 'all' ? 'Aucune battle pour le moment' : `Aucune battle ${filters.find(f => f.value === filterStatus)?.label.toLowerCase()}`}
            </h3>
            <p className="text-muted-foreground mb-6">
              Lancez votre première battle et laissez vos options combattre !
            </p>
            <div className="flex items-center justify-center space-x-3">
              <QuickBattleDialog onBattleCreated={refetch} />
              <CreateBattleDialog onBattleCreated={refetch} />
            </div>
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
