import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';

export default function DeleteAccountDialog() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!confirm('⚠️ ATTENTION : Cette action est irréversible. Toutes vos données seront définitivement supprimées. Continuer ?')) {
      return;
    }

    setLoading(true);

    try {
      await api.delete('/auth/delete-account', {
        data: { password }
      });

      toast.success('Compte supprimé avec succès');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer mon compte
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">⚠️ Supprimer le compte</DialogTitle>
          <DialogDescription>
            Cette action est <strong>irréversible</strong>. Toutes vos battles, arènes et collaborations seront définitivement supprimées.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDelete} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Confirmez avec votre mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading}
            >
              {loading ? 'Suppression...' : 'Supprimer définitivement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
