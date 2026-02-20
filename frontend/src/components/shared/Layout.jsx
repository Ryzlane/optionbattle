import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Swords, LogOut, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSound } from '../../contexts/SoundContext';
import { useArena } from '../../contexts/ArenaContext';
import { Button } from '../ui/Button';
import Sidebar from './Sidebar';
import FloatingFeedbackButton from '../feedback/FloatingFeedbackButton';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { soundEnabled, toggleSound } = useSound();
  const { arenas, selectedArena, setSelectedArena } = useArena();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/arena" className="flex items-center space-x-2 group">
              <div className="flex items-center justify-center w-10 h-10 bg-battle-primary rounded-lg group-hover:scale-110 transition-transform">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-battle-primary">OptionBattle</h1>
                <p className="text-xs text-muted-foreground -mt-1">Let them fight it out</p>
              </div>
            </Link>

            {/* Mobile Arena Selector */}
            <div className="flex-1 md:hidden px-4">
              <select
                value={selectedArena?.id || 'personal'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'personal') {
                    setSelectedArena(null);
                    navigate('/arena');
                  } else {
                    const arena = arenas.find(a => a.id === value);
                    setSelectedArena(arena);
                    navigate(`/arenas/${value}`);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-battle-primary"
              >
                <option value="personal">🗡️ Arena Perso</option>
                {arenas.map((arena) => (
                  <option key={arena.id} value={arena.id}>
                    👥 {arena.title}
                  </option>
                ))}
              </select>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">Arena Master</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-battle-primary to-battle-secondary rounded-full flex items-center justify-center text-white font-bold">
                  {(user?.name || user?.email)?.[0]?.toUpperCase()}
                </div>
              </div>

              {/* Sound toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSound}
                title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
                className="hidden sm:flex"
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-battle-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
              </Button>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with Sidebar */}
      <div className="flex">
        <Sidebar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

      {/* Floating feedback button */}
      <FloatingFeedbackButton />
    </div>
  );
}
