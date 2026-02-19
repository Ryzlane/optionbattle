import { useState, useEffect } from 'react';
import { Mail, X, Eye, Edit3, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export default function InvitationsList({ arenaId, onUpdate }) {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, [arenaId]);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/arena-collaboration/${arenaId}/invitations`);
      setInvitations(response.data.data.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Erreur lors du chargement des invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (invitationId) => {
    if (!confirm('Annuler cette invitation ?')) return;

    try {
      await api.delete(`/arena-collaboration/${arenaId}/invitations/${invitationId}`);
      toast.success('Invitation annulée');
      await fetchInvitations();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
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
      case 'editor':
        return 'Éditeur';
      case 'viewer':
        return 'Lecteur';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-battle-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">
          Aucune invitation en attente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="flex items-center justify-between p-3 rounded-lg border bg-slate-50"
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{invitation.email}</p>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                <div className="flex items-center space-x-1">
                  {getRoleIcon(invitation.role)}
                  <span>{getRoleLabel(invitation.role)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(invitation.createdAt), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCancel(invitation.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
