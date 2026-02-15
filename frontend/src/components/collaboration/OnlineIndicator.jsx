import { Circle } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function OnlineIndicator({ isConnected, onlineUsers = [] }) {
  return (
    <div className="flex items-center space-x-3 mb-4">
      {/* Status connexion */}
      <div className="flex items-center space-x-2">
        <Circle
          className={cn(
            'w-3 h-3 fill-current',
            isConnected ? 'text-green-500' : 'text-slate-400'
          )}
        />
        <span className="text-sm text-muted-foreground">
          {isConnected ? 'Connecté' : 'Déconnecté'}
        </span>
      </div>

      {/* Utilisateurs en ligne */}
      {onlineUsers.length > 0 && (
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 3).map((user, i) => (
              <div
                key={user.id}
                className="w-8 h-8 bg-battle-primary text-white rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                title={user.name || user.email}
              >
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {onlineUsers.length} {onlineUsers.length === 1 ? 'collaborateur' : 'collaborateurs'} en ligne
          </span>
        </div>
      )}
    </div>
  );
}
