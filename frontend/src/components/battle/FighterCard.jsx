import { useState } from 'react';
import { Trash2, Trophy, Zap, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import AddArgumentDialog from './AddArgumentDialog';
import ArgumentItem from './ArgumentItem';
import { cn } from '../../utils/cn';
import { useSound } from '../../contexts/SoundContext';

export default function FighterCard({ battleId, fighter, isChampion, onFighterUpdated, onFighterDeleted }) {
  const { playDelete } = useSound();
  const [deleting, setDeleting] = useState(false);

  const powers = fighter.arguments?.filter(arg => arg.type === 'power') || [];
  const weaknesses = fighter.arguments?.filter(arg => arg.type === 'weakness') || [];

  const powerScore = powers.reduce((sum, arg) => sum + arg.weight, 0);
  const weaknessScore = weaknesses.reduce((sum, arg) => sum + arg.weight, 0);
  const combatScore = fighter.score || (powerScore - weaknessScore);

  const handleDelete = async () => {
    if (!confirm(`Supprimer le fighter "${fighter.name}" ?`)) return;

    playDelete();
    setDeleting(true);
    try {
      await api.delete(`/battles/${battleId}/fighters/${fighter.id}`);
      toast.success('Fighter supprimé de l\'arène');
      if (onFighterDeleted) {
        onFighterDeleted(fighter.id);
      }
    } catch (error) {
      console.error('Erreur suppression fighter:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const handleArgumentAdded = () => {
    if (onFighterUpdated) {
      onFighterUpdated();
    }
  };

  const handleArgumentDeleted = () => {
    if (onFighterUpdated) {
      onFighterUpdated();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className={cn(
        'transition-all duration-200',
        isChampion && 'ring-2 ring-battle-combat shadow-lg',
        deleting && 'opacity-50'
      )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isChampion && (
              <div className="flex items-center space-x-1 mb-2">
                <Trophy className="w-4 h-4 text-battle-combat" />
                <span className="text-xs font-medium text-battle-combat">Champion</span>
              </div>
            )}
            <CardTitle className="flex items-center space-x-2">
              <span>{fighter.name}</span>
            </CardTitle>
            {fighter.description && (
              <p className="text-sm text-muted-foreground mt-1">{fighter.description}</p>
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-shrink-0"
          >
            <Trash2 className="w-4 h-4 text-battle-danger" />
          </Button>
        </div>

        {/* Score Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Combat Score</span>
            <span className={cn(
              'text-2xl font-bold',
              combatScore > 0 ? 'text-battle-secondary' : combatScore < 0 ? 'text-battle-danger' : 'text-slate-500'
            )}>
              {combatScore > 0 ? '+' : ''}{combatScore}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                combatScore > 0 ? 'bg-battle-secondary' : 'bg-battle-danger'
              )}
              style={{ width: `${Math.min(Math.abs(combatScore) * 10, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-battle-secondary" />
              <span>{powerScore}</span>
            </span>
            <span className="flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-battle-danger" />
              <span>{weaknessScore}</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Attack Powers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-battle-secondary flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>Attack Powers ({powers.length})</span>
            </h4>
            <AddArgumentDialog
              battleId={battleId}
              fighterId={fighter.id}
              type="power"
              onArgumentAdded={handleArgumentAdded}
            />
          </div>
          {powers.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Aucun attack power</p>
          ) : (
            <div className="space-y-2">
              {powers.map((arg) => (
                <ArgumentItem
                  key={arg.id}
                  battleId={battleId}
                  fighterId={fighter.id}
                  argument={arg}
                  onArgumentDeleted={handleArgumentDeleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-battle-danger flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Weaknesses ({weaknesses.length})</span>
            </h4>
            <AddArgumentDialog
              battleId={battleId}
              fighterId={fighter.id}
              type="weakness"
              onArgumentAdded={handleArgumentAdded}
            />
          </div>
          {weaknesses.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Aucune weakness</p>
          ) : (
            <div className="space-y-2">
              {weaknesses.map((arg) => (
                <ArgumentItem
                  key={arg.id}
                  battleId={battleId}
                  fighterId={fighter.id}
                  argument={arg}
                  onArgumentDeleted={handleArgumentDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
