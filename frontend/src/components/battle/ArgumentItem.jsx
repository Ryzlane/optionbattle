import { useState } from 'react';
import { Trash2, Zap, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { useSound } from '../../contexts/SoundContext';

export default function ArgumentItem({ battleId, fighterId, argument, onArgumentDeleted }) {
  const { playDelete } = useSound();
  const [deleting, setDeleting] = useState(false);

  const isPower = argument.type === 'power';
  const config = {
    power: {
      icon: Zap,
      color: 'text-battle-secondary',
      bgColor: 'bg-battle-secondary/10',
      borderColor: 'border-battle-secondary/20'
    },
    weakness: {
      icon: ShieldAlert,
      color: 'text-battle-danger',
      bgColor: 'bg-battle-danger/10',
      borderColor: 'border-battle-danger/20'
    }
  };

  const current = config[argument.type];
  const Icon = current.icon;

  const handleDelete = async () => {
    if (!confirm('Supprimer cet argument ?')) return;

    playDelete();
    setDeleting(true);
    try {
      await api.delete(`/battles/${battleId}/fighters/${fighterId}/arguments/${argument.id}`);
      toast.success('Argument supprimé');
      if (onArgumentDeleted) {
        onArgumentDeleted(argument.id);
      }
    } catch (error) {
      console.error('Erreur suppression argument:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
      className={cn(
        'group flex items-start space-x-3 p-3 rounded-lg border transition-all',
        current.bgColor,
        current.borderColor,
        deleting && 'opacity-50'
      )}
    >
      <div className={cn('flex-shrink-0 mt-0.5', current.color)}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 break-words">{argument.text}</p>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Power Level */}
        <div className="flex items-center space-x-1">
          <div className="flex space-x-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  'w-1.5 h-4 rounded-full',
                  level <= argument.weight
                    ? 'bg-battle-primary'
                    : 'bg-slate-200'
                )}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-battle-primary">{argument.weight}</span>
        </div>

        {/* Delete button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDelete}
          disabled={deleting}
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4 text-battle-danger" />
        </Button>
      </div>
    </motion.div>
  );
}
