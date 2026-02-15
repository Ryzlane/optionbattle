import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Swords, Loader2 } from 'lucide-react';
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

export default function CreateBattleDialog({ onBattleCreated }) {
  const navigate = useNavigate();
  const { playSuccess } = useSound();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

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
      const response = await api.post('/battles', {
        title: formData.title,
        description: formData.description,
        status: 'active'
      });

      playSuccess();
      toast.success('Battle créée avec succès ! Que le combat commence ⚔️');
      setOpen(false);
      setFormData({ title: '', description: '' });

      // Naviguer vers la battle
      navigate(`/battles/${response.data.data.battle.id}`);

      if (onBattleCreated) {
        onBattleCreated();
      }
    } catch (error) {
      console.error('Erreur création battle:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la battle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
          <Swords className="w-5 h-5 mr-2" />
          Lancer une Battle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle Battle</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre battle et laissez vos options combattre pour trouver la meilleure.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre de la battle <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex: iPhone vs Android"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Décrivez le contexte de votre décision..."
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 caractères
              </p>
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
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4 mr-2" />
                  Créer la battle
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
