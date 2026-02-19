import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useArena } from '../contexts/ArenaContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';

export default function AcceptInvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { refreshArenas } = useArena();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si l'auth est encore en cours de chargement, attendre
    if (authLoading) return;

    // Si l'utilisateur n'est pas connecté, sauvegarder le token et rediriger vers login
    if (!user) {
      sessionStorage.setItem('pendingInvitationToken', token);
      navigate('/login');
      return;
    }

    // Si connecté, accepter l'invitation
    handleAccept();
  }, [token, user, authLoading]);

  const handleAccept = async () => {
    try {
      const response = await api.post(`/arena-collaboration/invitations/${token}/accept`);
      const { arenaId, alreadyMember } = response.data.data;

      if (alreadyMember) {
        toast.info('Vous êtes déjà membre de cette arène');
      } else {
        toast.success(response.data.message);
      }

      // Nettoyer le token sauvegardé
      sessionStorage.removeItem('pendingInvitationToken');

      // Rafraîchir la liste des arènes dans la sidebar
      await refreshArenas();

      // Redirection après 1 seconde
      setTimeout(() => {
        navigate(`/arenas/${arenaId}`);
      }, 1000);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'acceptation de l\'invitation');
      setLoading(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-battle-primary mx-auto" />
          <p className="text-lg text-muted-foreground">
            Acceptation de l'invitation en cours...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md text-center space-y-4 p-8 bg-white rounded-lg shadow-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Invitation invalide</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/arena')}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
