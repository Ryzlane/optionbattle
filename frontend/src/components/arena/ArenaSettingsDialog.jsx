import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Settings, Mail, Link as LinkIcon, Trash2, Copy, Users, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

export default function ArenaSettingsDialog({ arenaId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [shareLinks, setShareLinks] = useState([]);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Share link form
  const [shareLinkRole, setShareLinkRole] = useState('editor');
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCollaborators();
      fetchShareLinks();
    }
  }, [open, arenaId]);

  const fetchCollaborators = async () => {
    try {
      const response = await api.get(`/arena-collaboration/${arenaId}/collaborators`);
      setCollaborators(response.data.data.collaborators);
    } catch (error) {
      console.error('Erreur fetch collaborateurs:', error);
    }
  };

  const fetchShareLinks = async () => {
    try {
      const response = await api.get(`/arena-collaboration/${arenaId}/share-links`);
      setShareLinks(response.data.data.shareLinks);
    } catch (error) {
      console.error('Erreur fetch liens:', error);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      await api.post(`/arena-collaboration/${arenaId}/collaborators`, {
        email: inviteEmail,
        role: inviteRole
      });

      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteEmail('');
      fetchCollaborators();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!confirm('Retirer ce collaborateur de l\'arène ?')) return;

    try {
      await api.delete(`/arena-collaboration/${arenaId}/collaborators/${userId}`);
      toast.success('Collaborateur retiré');
      fetchCollaborators();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleCreateShareLink = async () => {
    setLinkLoading(true);
    try {
      const response = await api.post(`/arena-collaboration/${arenaId}/share-links`, {
        role: shareLinkRole
      });

      const link = response.data.data.shareLink;
      const url = `${window.location.origin}/arena/join/${link.token}`;

      await navigator.clipboard.writeText(url);
      toast.success('Lien créé et copié dans le presse-papier !');
      fetchShareLinks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du lien');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCopyLink = async (token) => {
    const url = `${window.location.origin}/arena/join/${token}`;
    await navigator.clipboard.writeText(url);
    toast.success('Lien copié !');
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Supprimer ce lien de partage ?')) return;

    try {
      await api.delete(`/arena-collaboration/${arenaId}/share-links/${linkId}`);
      toast.success('Lien supprimé');
      fetchShareLinks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const isOwner = collaborators.find(c => c.role === 'owner')?.user.id === user?.id;

  const getRoleLabel = (role) => {
    switch(role) {
      case 'owner': return 'Propriétaire';
      case 'editor': return 'Éditeur';
      case 'viewer': return 'Lecteur';
      default: return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paramètres de l'arène</DialogTitle>
          <DialogDescription>
            Gérez les collaborateurs et les liens de partage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invite by email */}
          {isOwner && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-battle-primary" />
                <h3 className="text-lg font-semibold">Inviter par email</h3>
              </div>
              <form onSubmit={handleInvite} className="space-y-3">
                <div>
                  <Label htmlFor="email">Email de l'utilisateur</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="collaborateur@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <select
                    id="role"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="editor">Éditeur (peut modifier)</option>
                    <option value="viewer">Lecteur (lecture seule)</option>
                  </select>
                </div>
                <Button type="submit" disabled={inviteLoading} className="w-full">
                  {inviteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer l'invitation
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Collaborators list */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-battle-primary" />
              <h3 className="text-lg font-semibold">
                Collaborateurs ({collaborators.length})
              </h3>
            </div>
            <div className="space-y-2">
              {collaborators.map((collab) => (
                <div
                  key={collab.user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium">{collab.user.name || collab.user.email}</p>
                    <p className="text-sm text-muted-foreground">{collab.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-2 py-1 bg-slate-100 rounded">
                      {getRoleLabel(collab.role)}
                    </span>
                    {isOwner && collab.user.id !== user.id && collab.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCollaborator(collab.user.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share links */}
          {isOwner && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-battle-primary" />
                <h3 className="text-lg font-semibold">Liens de partage</h3>
              </div>

              <div className="flex gap-2">
                <select
                  className="rounded-md border border-input bg-background px-3 py-2"
                  value={shareLinkRole}
                  onChange={(e) => setShareLinkRole(e.target.value)}
                >
                  <option value="editor">Éditeur</option>
                  <option value="viewer">Lecteur</option>
                </select>
                <Button onClick={handleCreateShareLink} disabled={linkLoading}>
                  {linkLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Créer un lien
                    </>
                  )}
                </Button>
              </div>

              {shareLinks.length > 0 && (
                <div className="space-y-2">
                  {shareLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-mono truncate">
                          {window.location.origin}/arena/join/{link.token}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getRoleLabel(link.role)} • Utilisé {link.usageCount} fois
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyLink(link.token)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLink(link.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
