import { Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../utils/cn';

export default function BadgeItem({ badge, size = 'default' }) {
  const sizes = {
    sm: 'w-12 h-12 text-2xl',
    default: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl'
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all',
        badge.unlocked
          ? 'bg-gradient-to-br from-battle-secondary/10 to-battle-primary/5 border-battle-secondary/20 hover:shadow-md'
          : 'bg-slate-50 border-slate-200 opacity-60'
      )}
    >
      {/* Badge Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full transition-transform hover:scale-110',
          sizes[size],
          badge.unlocked
            ? 'bg-gradient-to-br from-battle-secondary to-battle-primary shadow-lg'
            : 'bg-slate-200'
        )}
      >
        {badge.unlocked ? (
          <span className="filter drop-shadow-sm">{badge.icon}</span>
        ) : (
          <Lock className="w-6 h-6 text-slate-400" />
        )}
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h4
          className={cn(
            'font-semibold',
            badge.unlocked ? 'text-slate-900' : 'text-slate-500'
          )}
        >
          {badge.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {badge.description}
        </p>
        {badge.unlocked && badge.unlockedAt && (
          <p className="text-xs text-battle-secondary mt-2">
            Débloqué {formatDistanceToNow(new Date(badge.unlockedAt), {
              addSuffix: true,
              locale: fr
            })}
          </p>
        )}
      </div>
    </div>
  );
}
