import { useState, useEffect } from 'react';
import { Share2, Copy, Mail, Link as LinkIcon, Trash2, Plus, Inbox, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
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

export default function ArenaShareDialog({ arenaId, isOwner }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('invite'); // invite, pending, links, members
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [shareLinkRole, setShareLinkRole] = useState('editor');
  const [shareLinks, setShareLinks] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAll();
    }
  }, [open]);

  const fetchAll = async () => {
    await Promise.all([
      fetchShareLinks(),
      fetchInvitations(),
      fetchCollaborators()
    ]);
  };

  const fetchShareLinks = async () => {
    try {
      const response = await api.get(`/arena-collaboration/${arenaId}/share-links`);
      setShareLinks(response.data.data.shareLinks || []);
    } catch (error) {
      console.error('Error fetching share links:', error);
    }
  };

  const fetchInvitations = async () => {
    if (!isOwner) return;
    try {
      const response = await api.get(`/arena-collaboration/${arenaId}/invitations`);
      setInvitations(response.data.data.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const response = await api.get(`/arena-collaboration/${arenaId}/collaborators`);
      setCollaborators(response.data.data.collaborators || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const handleInviteByEmail = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    try {
      await api.post(`/arena-collaboration/${arenaId}/invitations`, {
        email: inviteEmail.trim(),
        role: inviteRole
      });

      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteEmail('');
      await fetchInvitations();
      setActiveTab('pending');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShareLink = async () => {
    setLoading(true);
    try {
      await api.post(`/arena-collaboration/${arenaId}/share-links`, {
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
      await api.delete(`/arena-collaboration/${arenaId}/share-links/${linkId}`);
      toast.success('Lien supprimé');
      await fetchShareLinks();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!confirm('Annuler cette invitation ?')) return;

    try {
      await api.delete(`/arena-collaboration/${arenaId}/invitations/${invitationId}`);
      toast.success('Invitation annulée');
      await fetchInvitations();
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!confirm('Retirer ce collaborateur ?')) return;

    try {
      await api.delete(`/arena-collaboration/${arenaId}/collaborators/${userId}`);
      toast.success('Collaborateur retiré');
      await fetchCollaborators();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner': return 'Propriétaire';
      case 'editor': return 'Éditeur';
      case 'viewer': return 'Lecteur';
      default: return role;
    }
  };

  const tabs = [
    { id: 'invite', label: 'Inviter', icon: Mail, ownerOnly: true },
    { id: 'pending', label: `Invitations (${invitations.length})`, icon: Inbox, ownerOnly: true },
    { id: 'members', label: `Membres (${collaborators.length})`, icon: Users },
    { id: 'links', label: `Liens (${shareLinks.length})`, icon: LinkIcon, ownerOnly: true },
  ].filter(tab => !tab.ownerOnly || isOwner);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Partager cette arène</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-battle-primary text-battle-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Tab: Inviter par email */}
          {activeTab === 'invite' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Invitez quelqu'un par email. Il recevra un lien pour accepter l'invitation.
              </p>
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
                Les éditeurs peuvent créer et modifier des battles. Les lecteurs peuvent uniquement consulter.
              </p>
            </div>
          )}

          {/* Tab: Invitations pendantes */}
          {activeTab === 'pending' && (
            <div className="space-y-2">
              {invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    Aucune invitation en attente
                  </p>
                </div>
              ) : (
                invitations.map((invitation) => (
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
                          <span>{getRoleLabel(invitation.role)}</span>
                          <span>
                            {formatDistanceToNow(new Date(invitation.createdAt), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: Membres */}
          {activeTab === 'members' && (
            <div className="space-y-2">
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-battle-primary to-battle-secondary rounded-full flex items-center justify-center text-white font-bold">
                      {collab.user.name?.charAt(0).toUpperCase() || collab.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{collab.user.name || collab.user.email}</p>
                      <p className="text-sm text-muted-foreground">{collab.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-2 py-1 bg-slate-100 rounded">
                      {getRoleLabel(collab.role)}
                    </span>
                    {isOwner && collab.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCollaborator(collab.user.id)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Liens de partage */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
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

              {shareLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun lien de partage créé
                </p>
              ) : (
                <div className="space-y-2">
                  {shareLinks.map((link) => {
                    const url = `${window.location.origin}/arena/join/${link.token}`;
                    return (
                      <div
                        key={link.id}
                        className="flex items-center space-x-2 p-3 bg-slate-50 rounded-md"
                      >
                        <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono truncate">{url}</p>
                          <p className="text-xs text-muted-foreground">
                            {getRoleLabel(link.role)} • Utilisé {link.usageCount} fois
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
