import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Zap, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useSound } from '../../contexts/SoundContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import TemplateCard from './TemplateCard';

export default function QuickBattleDialog({ onBattleCreated }) {
  const navigate = useNavigate();
  const { playSuccess } = useSound();
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingTemplateId, setUsingTemplateId] = useState(null);

  // Charger les templates quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/templates');
      setTemplates(response.data.data.templates);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template) => {
    setUsingTemplateId(template.id);

    try {
      const response = await api.post(`/templates/${template.id}/use`);
      const battle = response.data.data.battle;

      playSuccess();
      toast.success(`Battle "${template.title}" créée ! 🎯`, {
        description: `${battle.fighters.length} fighters prêts au combat`
      });

      setOpen(false);
      setUsingTemplateId(null);

      // Naviguer vers la battle
      navigate(`/battles/${battle.id}`);

      if (onBattleCreated) {
        onBattleCreated();
      }
    } catch (error) {
      console.error('Erreur utilisation template:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la battle');
      setUsingTemplateId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="border-2 border-dashed hover:border-battle-primary">
          <Zap className="w-5 h-5 mr-2" />
          Quick Battle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Zap className="w-6 h-6 text-battle-primary" />
            <span>Quick Battles - Templates</span>
          </DialogTitle>
          <DialogDescription>
            Démarrez instantanément avec une battle pré-configurée. Tous les fighters et arguments sont déjà en place !
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-battle-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement des templates...</p>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun template disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                  isUsing={usingTemplateId === template.id}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
