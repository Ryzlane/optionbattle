import { useState, useEffect } from 'react';
import { Users, Crown, Eye, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { Button } from '../ui/Button';

export default function ArenaCollaboratorsList({ arenaId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger au montage pour afficher le bon nombre
  useEffect(() => {
    fetchCollaborators();
  }, [arenaId]);

  // Recharger quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      fetchCollaborators();
    }
  }, [open]);

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/arena-collaboration/${arenaId}/collaborators`);
      setCollaborators(response.data.data.collaborators || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      // Ne pas afficher de toast si c'est au chargement initial
      if (open) {
        toast.error('Erreur lors du chargement des membres');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Retirer ce membre de l\'arène ?')) return;

    try {
      await api.delete(`/arena-collaboration/${arenaId}/collaborators/${userId}`);
      toast.success('Membre retiré de l\'arène');
      await fetchCollaborators();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Vérifier si l'utilisateur actuel est le propriétaire
  const isOwner = collaborators.find(c => c.role === 'owner')?.user.id === user?.id;

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-slate-500" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Propriétaire';
      case 'editor':
        return 'Éditeur';
      case 'viewer':
        return 'Lecteur';
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Membres ({collaborators.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Membres de l'arène</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-battle-primary border-t-transparent rounded-full"></div>
          </div>
        ) : collaborators.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun membre pour le moment
          </p>
        ) : (
          <div className="space-y-2">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-slate-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-battle-primary to-battle-secondary rounded-full flex items-center justify-center text-white font-bold">
                    {collab.user.name?.charAt(0).toUpperCase() || collab.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{collab.user.name || collab.user.email}</p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      {getRoleIcon(collab.role)}
                      <span>{getRoleLabel(collab.role)}</span>
                    </div>
                  </div>
                </div>

                {/* Delete button - only for owner and not for owner's own entry */}
                {isOwner && collab.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(collab.user.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
