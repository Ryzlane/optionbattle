import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useArena } from '../../contexts/ArenaContext';
import { Button } from '../ui/Button';
import CreateArenaDialog from './CreateArenaDialog';
import { Swords, Users, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Sidebar() {
  const { arenas, selectedArena, setSelectedArena } = useArena();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isArenaRoute = location.pathname === '/arena';

  return (
    <aside
      className={cn(
        'sticky top-16 h-[calc(100vh-64px)] bg-white border-r border-slate-200',
        'transition-all duration-200 flex flex-col',
        'hidden md:flex',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {isOpen && <h3 className="font-semibold text-sm text-slate-700">Mes Arènes</h3>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-shrink-0"
        >
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Personal Arena */}
      <Link
        to="/arena"
        className={cn(
          'flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors',
          isArenaRoute && !selectedArena && 'bg-battle-primary/10 border-r-2 border-battle-primary'
        )}
        onClick={() => setSelectedArena(null)}
      >
        <Swords className="w-5 h-5 text-battle-primary flex-shrink-0" />
        {isOpen && <span className="text-sm font-medium">Arena Perso</span>}
      </Link>

      {/* Arenas List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {arenas.map((arena) => {
          const isSelected = selectedArena?.id === arena.id;
          const battlesCount = arena._count?.battles || 0;

          return (
            <Link
              key={arena.id}
              to={`/arenas/${arena.id}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors',
                isSelected && 'bg-battle-primary/10 border-r-2 border-battle-primary'
              )}
              onClick={() => setSelectedArena(arena)}
            >
              <Users className="w-5 h-5 text-slate-600 flex-shrink-0" />
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {arena.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {battlesCount} battle{battlesCount > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Create Arena Button */}
      {isOpen && (
        <div className="p-4 border-t">
          <CreateArenaDialog />
        </div>
      )}
    </aside>
  );
}
