import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Swords } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      await login(formData.email, formData.password);
      toast.success('Connexion réussie ! Bienvenue dans l\'arène ⚔️');

      // Vérifier s'il y a un token d'arène en attente
      const pendingArenaToken = sessionStorage.getItem('pendingArenaToken');
      if (pendingArenaToken) {
        navigate(`/arena/join/${pendingArenaToken}`);
      } else {
        navigate('/arena');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-battle-primary/10 via-white to-battle-secondary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-battle-primary rounded-full mb-4">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-battle-primary mb-2">OptionBattle</h1>
          <p className="text-muted-foreground">Let your options fight it out</p>
        </div>

        {/* Login Card */}
        <Card className="animate-slide-in">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Entrez dans l'arène et laissez vos options combattre
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="fighter@optionbattle.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-battle-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Connexion...
                  </>
                ) : (
                  'Entrer dans l\'arène'
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link
                  to="/register"
                  className="text-battle-primary font-medium hover:underline"
                >
                  Créer un compte
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
