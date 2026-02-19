import { useState } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Button } from '../ui/Button';

export default function FeedbackDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop grande (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() && !screenshot) {
      toast.error('Ajoutez un message ou une image');
      return;
    }

    setLoading(true);
    try {
      await api.post('/feedback', {
        message: message.trim() || null,
        screenshot,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      });

      toast.success('Merci pour votre feedback ! 🙏');
      setMessage('');
      setScreenshot(null);
      setPreview(null);
      setOpen(false);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Envoyer un feedback</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre feedback..."
              className="w-full min-h-[120px] px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-battle-primary"
              maxLength={5000}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image (optionnel)</label>
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">Ajouter une image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            ) : (
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => { setScreenshot(null); setPreview(null); }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-md">
            <p className="text-xs text-slate-600">
              📍 Page : <span className="font-mono">{window.location.pathname}</span>
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || (!message.trim() && !screenshot)}>
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
