import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Swords } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Mot de passe réinitialisé avec succès !');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-battle-primary/10 via-white to-battle-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-battle-primary rounded-full mb-4">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-battle-primary mb-2">OptionBattle</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nouveau mot de passe</CardTitle>
            <CardDescription>
              Choisissez un nouveau mot de passe sécurisé
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Réinitialisation...' : 'Réinitialiser mon mot de passe'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
