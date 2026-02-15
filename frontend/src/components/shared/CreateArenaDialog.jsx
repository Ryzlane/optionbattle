import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, Loader2, Plus } from 'lucide-react';
import { useArena } from '../../contexts/ArenaContext';
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

export default function CreateArenaDialog() {
  const navigate = useNavigate();
  const { createArena } = useArena();
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
      const arena = await createArena({
        title: formData.title,
        description: formData.description
      });

      playSuccess();
      toast.success('Arène créée avec succès !');
      setOpen(false);
      setFormData({ title: '', description: '' });

      // Navigate to the new arena
      navigate(`/arenas/${arena.id}`);
    } catch (error) {
      console.error('Erreur création arène:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de l\'arène');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Créer une Arène
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle Arène</DialogTitle>
            <DialogDescription>
              Une arène permet de regrouper plusieurs battles et de collaborer avec d'autres utilisateurs.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre de l'arène <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex: Projet X, Équipe Marketing, etc."
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
                placeholder="Décrivez l'objectif de cette arène..."
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
                  <Users className="w-4 h-4 mr-2" />
                  Créer l'arène
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
