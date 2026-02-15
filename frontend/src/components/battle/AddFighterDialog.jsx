import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';
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

export default function AddFighterDialog({ battleId, onFighterAdded }) {
  const { playSuccess } = useSound();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
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
      const response = await api.post(`/battles/${battleId}/fighters`, formData);
      playSuccess();
      toast.success(`Fighter "${formData.name}" ajouté à l'arène ! 🥊`, {
        description: 'Ajoutez des Attack Powers et Weaknesses pour le renforcer'
      });
      setOpen(false);
      setFormData({ name: '', description: '' });

      if (onFighterAdded) {
        onFighterAdded(response.data.data.fighter);
      }
    } catch (error) {
      console.error('Erreur ajout fighter:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du fighter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed border-2">
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un Fighter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajouter un Fighter</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle option à comparer dans cette battle.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom du fighter <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: iPhone 16 Pro"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Brève description de cette option..."
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                maxLength={500}
              />
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
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
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
