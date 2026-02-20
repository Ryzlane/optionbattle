import { useState, useEffect } from 'react';
import { Users, Trash2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function CollaboratorsList({ battleId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);

  // Vérifier si l'utilisateur actuel est le propriétaire
  const isOwner = collaborators.find(c => c.role === 'owner')?.user.id === user.id;

  // Charger au montage pour afficher le bon nombre
  useEffect(() => {
    fetchCollaborators();
  }, [battleId]);

  // Recharger quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      fetchCollaborators();
    }
  }, [open]);

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/collaboration/${battleId}/collaborators`);
      setCollaborators(response.data.data.collaborators || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      // Ne pas afficher de toast si c'est au chargement initial
      if (open) {
        toast.error('Erreur lors du chargement des collaborateurs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Retirer ce collaborateur ?')) return;

    try {
      await api.delete(`/collaboration/${battleId}/collaborators/${userId}`);
      toast.success('Collaborateur retiré');
      await fetchCollaborators();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Collaborateurs ({collaborators.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Collaborateurs</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-battle-primary border-t-transparent rounded-full"></div>
          </div>
        ) : collaborators.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun collaborateur pour le moment
          </p>
        ) : (
          <div className="space-y-2">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-battle-primary text-white rounded-full flex items-center justify-center font-medium">
                    {collab.user.name?.[0]?.toUpperCase() || collab.user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {collab.user.name || collab.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center space-x-2">
                      {collab.role === 'owner' ? (
                        <span className="flex items-center space-x-1 text-amber-600">
                          <Crown className="w-3 h-3" />
                          <span>Propriétaire</span>
                        </span>
                      ) : (
                        <span>{collab.role === 'editor' ? 'Éditeur' : 'Lecteur'}</span>
                      )}
                      {collab.fromArena && (
                        <span className="ml-2 text-xs text-blue-600">• Membre de l'arène</span>
                      )}
                    </p>
                  </div>
                </div>

                {isOwner && collab.user.id !== user.id && collab.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(collab.user.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
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
