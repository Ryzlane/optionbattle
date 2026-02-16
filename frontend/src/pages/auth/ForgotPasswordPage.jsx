import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Swords, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Email envoyé ! Vérifiez votre boîte de réception');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
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
            <CardTitle>Mot de passe oublié ?</CardTitle>
            <CardDescription>
              Entrez votre email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>

          {sent ? (
            <CardContent className="text-center py-8">
              <p className="text-lg mb-4">✉️ Email envoyé !</p>
              <p className="text-muted-foreground mb-6">
                Vérifiez votre boîte de réception et cliquez sur le lien de réinitialisation.
              </p>
              <p className="text-sm text-muted-foreground">
                Le lien expire dans <strong>15 minutes</strong>.
              </p>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </Button>

                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-battle-primary flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
