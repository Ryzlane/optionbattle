import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Swords, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';

export default function JoinBattlePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleJoin();
  }, [token]);

  const handleJoin = async () => {
    try {
      const response = await api.post(`/collaboration/join/${token}`);
      const { battleId, alreadyMember } = response.data.data;

      if (alreadyMember) {
        toast.info('Vous êtes déjà membre de cette battle');
      } else {
        toast.success(response.data.message);
      }

      // Redirection après 1 seconde
      setTimeout(() => {
        navigate(`/battles/${battleId}`);
      }, 1000);
    } catch (error) {
      console.error('Error joining battle:', error);
      setError(error.response?.data?.message || 'Erreur lors de la connexion à la battle');
      setLoading(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-battle-primary mx-auto" />
          <p className="text-lg text-muted-foreground">
            Connexion à la battle en cours...
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
          <h1 className="text-2xl font-bold text-slate-900">Lien invalide</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/arena')}>
            Retour à l'arène
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
