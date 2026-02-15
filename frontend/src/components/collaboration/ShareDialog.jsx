import { useState, useEffect } from 'react';
import { Share2, Copy, Mail, Link as LinkIcon, Trash2, Plus } from 'lucide-react';
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
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

export default function ShareDialog({ battleId }) {
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [shareLinkRole, setShareLinkRole] = useState('editor');
  const [shareLinks, setShareLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchShareLinks();
    }
  }, [open]);

  const fetchShareLinks = async () => {
    try {
      const response = await api.get(`/collaboration/${battleId}/share-links`);
      setShareLinks(response.data.data.shareLinks || []);
    } catch (error) {
      console.error('Error fetching share links:', error);
    }
  };

  const handleInviteByEmail = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    try {
      await api.post(`/collaboration/${battleId}/collaborators`, {
        email: inviteEmail.trim(),
        role: inviteRole
      });

      toast.success('Invitation envoyée');
      setInviteEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShareLink = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/collaboration/${battleId}/share-links`, {
        role: shareLinkRole
      });

      toast.success('Lien créé');
      await fetchShareLinks();
    } catch (error) {
      toast.error('Erreur lors de la création du lien');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Lien copié dans le presse-papier');
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Supprimer ce lien de partage ?')) return;

    try {
      await api.delete(`/collaboration/${battleId}/share-links/${linkId}`);
      toast.success('Lien supprimé');
      await fetchShareLinks();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Partager cette battle</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Inviter par email */}
          <div className="space-y-3">
            <Label>Inviter par email</Label>
            <form onSubmit={handleInviteByEmail} className="flex space-x-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                disabled={loading}
              >
                <option value="editor">Éditeur</option>
                <option value="viewer">Lecteur</option>
              </select>
              <Button type="submit" disabled={loading || !inviteEmail.trim()}>
                <Mail className="w-4 h-4 mr-2" />
                Inviter
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Les éditeurs peuvent modifier la battle. Les lecteurs peuvent uniquement consulter.
            </p>
          </div>

          <div className="border-t pt-6">
            <div className="mb-4">
              <Label>Liens de partage</Label>
              <div className="flex items-center space-x-2 mt-3">
                <select
                  value={shareLinkRole}
                  onChange={(e) => setShareLinkRole(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                  disabled={loading}
                >
                  <option value="editor">Éditeur (peut modifier)</option>
                  <option value="viewer">Lecteur (lecture seule)</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateShareLink}
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer
                </Button>
              </div>
            </div>

            {shareLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun lien de partage créé
              </p>
            ) : (
              <div className="space-y-2">
                {shareLinks.map((link) => {
                  const url = `${window.location.origin}/battle/join/${link.token}`;
                  return (
                    <div
                      key={link.id}
                      className="flex items-center space-x-2 p-3 bg-slate-50 rounded-md"
                    >
                      <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate">{url}</p>
                        <p className="text-xs text-muted-foreground">
                          {link.role === 'editor' ? 'Éditeur' : 'Lecteur'} • Utilisé {link.usageCount} fois
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
