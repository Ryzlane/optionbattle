import { useState } from 'react';
import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import { toast } from 'sonner';

export default function FeedbackDialog({ open, onOpenChange }) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }

      // Convertir en base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message && !screenshot) {
      toast.error('Veuillez ajouter un message ou une capture d\'écran');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/feedback', {
        email: email || undefined,
        message: message || undefined,
        screenshot: screenshot || undefined,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      });

      toast.success('Merci pour votre feedback !');

      // Reset form
      setMessage('');
      setEmail('');
      setScreenshot(null);
      setScreenshotPreview(null);

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Erreur lors de l\'envoi du feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Envoyer un feedback</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (optional) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email (optionnel)
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pour que nous puissions vous répondre
            </p>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
              Message (optionnel)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre suggestion, problème ou commentaire..."
              className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-battle-primary resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Screenshot upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Capture d'écran (optionnelle)
            </label>

            {screenshotPreview ? (
              <div className="relative">
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full h-40 object-cover rounded-md border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setScreenshot(null);
                    setScreenshotPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:border-battle-primary transition-colors">
                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">Cliquez pour ajouter une image</span>
                <span className="text-xs text-muted-foreground mt-1">Max 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            )}
          </div>

          {/* Info about page URL */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Page actuelle :</strong> {window.location.pathname}
            </p>
          </div>

          {/* Submit button */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || (!message && !screenshot)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
