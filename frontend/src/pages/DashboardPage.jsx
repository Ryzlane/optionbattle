import { useState, useEffect } from 'react';
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
  const [battles, setBattles] = useState([]);
  const [allBattles, setAllBattles] = useState([]); // Pour les stats globales
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBattles = async () => {
    setLoading(true);
    try {
      // Récupérer toutes les battles pour les stats
      const allResponse = await api.get('/battles');
      // Filtrer uniquement les battles personnelles (sans arenaId)
      const personalBattles = allResponse.data.data.battles.filter(b => !b.arenaId);
      setAllBattles(personalBattles);

      // Récupérer les battles filtrées pour l'affichage
      const url = filterStatus === 'all' ? '/battles' : `/battles?status=${filterStatus}`;
      const response = await api.get(url);
      // Filtrer uniquement les battles personnelles (sans arenaId)
      const filteredPersonalBattles = response.data.data.battles.filter(b => !b.arenaId);
      setBattles(filteredPersonalBattles);
    } catch (error) {
      console.error('Erreur chargement battles:', error);
      toast.error('Erreur lors du chargement des battles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBattles();
  }, [filterStatus]);

  const filters = [
    { value: 'all', label: 'Toutes', icon: Zap },
    { value: 'active', label: 'En cours', icon: Swords },
    { value: 'completed', label: 'Terminées', icon: Trophy },
  ];

  // Calculer les stats sur TOUTES les battles, pas seulement les filtrées
  const stats = {
    total: allBattles.length,
    active: allBattles.filter(b => b.status === 'active').length,
    completed: allBattles.filter(b => b.status === 'completed').length,
  };

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
            <QuickBattleDialog onBattleCreated={fetchBattles} />
            <CreateBattleDialog onBattleCreated={fetchBattles} />
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
        {loading ? (
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
              <QuickBattleDialog onBattleCreated={fetchBattles} />
              <CreateBattleDialog onBattleCreated={fetchBattles} />
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
