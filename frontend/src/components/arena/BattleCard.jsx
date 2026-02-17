import { Link } from 'react-router-dom';
import { Clock, Users, Trophy, Calendar, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../utils/cn';

const statusConfig = {
  draft: {
    label: 'Brouillon',
    color: 'bg-slate-100 text-slate-700',
    icon: '📝'
  },
  active: {
    label: 'En cours',
    color: 'bg-battle-warning/10 text-battle-warning',
    icon: '⚔️'
  },
  completed: {
    label: 'Terminée',
    color: 'bg-battle-secondary/10 text-battle-secondary',
    icon: '🏆'
  },
  archived: {
    label: 'Archivée',
    color: 'bg-slate-200 text-slate-600',
    icon: '📦'
  }
};

export default function BattleCard({ battle }) {
  const status = statusConfig[battle.status] || statusConfig.draft;
  const fightersCount = battle._count?.fighters ?? battle.fighters?.length ?? 0;
  const collaboratorsCount = battle.collaboratorsCount || 1;
  const hasChampion = !!battle.championId;

  const championFighter = hasChampion
    ? battle.fighters?.find(f => f.id === battle.championId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={`/battles/${battle.id}`} className="block group">
        <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', status.color)}>
                  {status.icon} {status.label}
                </span>
              </div>
              <CardTitle className="line-clamp-2 group-hover:text-battle-primary transition-colors">
                {battle.title}
              </CardTitle>
              {battle.description && (
                <CardDescription className="line-clamp-2 mt-2">
                  {battle.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Stats */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{fightersCount} fighter{fightersCount > 1 ? 's' : ''}</span>
              </div>
              {collaboratorsCount > 1 && (
                <div className="flex items-center space-x-1 text-battle-primary">
                  <UserPlus className="w-4 h-4" />
                  <span>{collaboratorsCount} collaborateur{collaboratorsCount > 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(battle.updatedAt), {
                    addSuffix: true,
                    locale: fr
                  })}
                </span>
              </div>
            </div>

            {/* Champion */}
            {hasChampion && championFighter && (
              <div className="flex items-center space-x-2 p-3 bg-battle-secondary/10 rounded-lg border border-battle-secondary/20">
                <Trophy className="w-5 h-5 text-battle-secondary" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-battle-secondary">Champion actuel</p>
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {championFighter.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-battle-secondary">
                    {championFighter.score > 0 ? '+' : ''}{championFighter.score}
                  </p>
                </div>
              </div>
            )}

            {/* No fighters yet */}
            {fightersCount === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Aucun fighter ajouté. Commencez la battle ! ⚔️
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
    </motion.div>
  );
}
