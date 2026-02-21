import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Image as ImageIcon, Calendar, Mail, User, ExternalLink } from 'lucide-react';
import Layout from '../components/shared/Layout';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

export default function FeedbacksPage() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin';

  // Fetch feedbacks
  const { data: feedbacksData, isLoading } = useQuery({
    queryKey: ['feedbacks', selectedStatus],
    queryFn: async () => {
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : '';
      const response = await api.get(`/feedback${params}`);
      return response.data.data;
    }
  });

  // Update feedback status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.patch(`/feedback/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feedbacks']);
      toast.success('Statut mis à jour');
      setSelectedFeedback(null);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    }
  });

  const feedbacks = feedbacksData?.feedbacks || [];
  const total = feedbacksData?.total || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Feedbacks</h1>
            <p className="text-muted-foreground">
              {total} feedback{total > 1 ? 's' : ''} au total
            </p>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              Tous
            </Button>
            <Button
              variant={selectedStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('pending')}
            >
              À traiter
            </Button>
            <Button
              variant={selectedStatus === 'in_progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('in_progress')}
            >
              En cours
            </Button>
            <Button
              variant={selectedStatus === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('archived')}
            >
              Archivés
            </Button>
            <Button
              variant={selectedStatus === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('completed')}
            >
              Terminés
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && feedbacks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun feedback pour le moment</p>
          </div>
        )}

        {/* Feedbacks list */}
        {!isLoading && feedbacks.length > 0 && (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-battle-primary to-battle-secondary rounded-full flex items-center justify-center text-white font-bold">
                      {feedback.user?.name?.[0]?.toUpperCase() || feedback.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {feedback.user?.name || feedback.email || 'Anonyme'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(feedback.createdAt), 'PPP à HH:mm', { locale: fr })}
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    <select
                      value={feedback.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: feedback.id, status: e.target.value })}
                      disabled={!isAdmin}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-opacity ${
                        !isAdmin ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                      } ${
                        feedback.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : feedback.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : feedback.status === 'archived'
                          ? 'bg-slate-50 text-slate-700 border-slate-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}
                    >
                      <option value="pending">À traiter</option>
                      <option value="in_progress">En cours</option>
                      <option value="archived">Archivés</option>
                      <option value="completed">Terminés</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                {feedback.message && (
                  <div className="mb-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{feedback.message}</p>
                  </div>
                )}

                {/* Screenshot */}
                {feedback.screenshot && (
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedFeedback(feedback)}
                      className="relative group"
                    >
                      <img
                        src={feedback.screenshot}
                        alt="Screenshot"
                        className="max-w-md rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-slate-100">
                  {feedback.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {feedback.email}
                    </div>
                  )}
                  {feedback.pageUrl && (
                    <a
                      href={feedback.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-battle-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {new URL(feedback.pageUrl).pathname}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Screenshot modal */}
        {selectedFeedback?.screenshot && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFeedback(null)}
          >
            <div className="max-w-5xl max-h-[90vh] overflow-auto">
              <img
                src={selectedFeedback.screenshot}
                alt="Screenshot"
                className="rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
