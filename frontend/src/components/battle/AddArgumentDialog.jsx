import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2, Zap, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { useSound } from '../../contexts/SoundContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Slider } from '../ui/Slider';

export default function AddArgumentDialog({ battleId, fighterId, type = 'power', onArgumentAdded, triggerButton }) {
  const { playAction } = useSound();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    weight: 3
  });

  const isPower = type === 'power';
  const config = {
    power: {
      title: 'Attack Power',
      description: 'Un point fort qui renforce ce fighter',
      icon: Zap,
      color: 'text-battle-secondary',
      bgColor: 'bg-battle-secondary/10',
      placeholder: 'Ex: Écosystème Apple intégré'
    },
    weakness: {
      title: 'Weakness',
      description: 'Un point faible qui affaiblit ce fighter',
      icon: ShieldAlert,
      color: 'text-battle-danger',
      bgColor: 'bg-battle-danger/10',
      placeholder: 'Ex: Prix très élevé'
    }
  };

  const current = config[type];
  const Icon = current.icon;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post(
        `/battles/${battleId}/fighters/${fighterId}/arguments`,
        {
          text: formData.text,
          type,
          weight: formData.weight
        }
      );

      playAction();
      toast.success(`${current.title} ajouté avec succès !`, {
        description: `Power Level: ${formData.weight}/5`
      });
      setOpen(false);
      setFormData({ text: '', weight: 3 });

      if (onArgumentAdded) {
        onArgumentAdded(response.data.data.argument);
      }
    } catch (error) {
      console.error('Erreur ajout argument:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button size="sm" variant="outline" className={`${current.bgColor} border-0`}>
            <Plus className="w-4 h-4 mr-1" />
            <Icon className={`w-4 h-4 ${current.color}`} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Icon className={`w-5 h-5 ${current.color}`} />
              <span>Ajouter {current.title}</span>
            </DialogTitle>
            <DialogDescription>{current.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text">
                Argument <span className="text-red-500">*</span>
              </Label>
              <Input
                id="text"
                name="text"
                placeholder={current.placeholder}
                value={formData.text}
                onChange={handleChange}
                required
                disabled={loading}
                maxLength={500}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Power Level</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-battle-primary">{formData.weight}</span>
                  <span className="text-sm text-muted-foreground">/ 5</span>
                </div>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[formData.weight]}
                onValueChange={(value) => setFormData({ ...formData, weight: value[0] })}
                disabled={loading}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Faible</span>
                <span>Moyen</span>
                <span>Fort</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !formData.text.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
