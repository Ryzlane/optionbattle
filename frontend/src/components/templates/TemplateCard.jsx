import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

const categoryColors = {
  tech: 'bg-blue-100 text-blue-700 border-blue-200',
  dev: 'bg-purple-100 text-purple-700 border-purple-200',
  travel: 'bg-green-100 text-green-700 border-green-200',
  work: 'bg-orange-100 text-orange-700 border-orange-200',
  gaming: 'bg-red-100 text-red-700 border-red-200'
};

export default function TemplateCard({ template, onUse, isUsing }) {
  const categoryColor = categoryColors[template.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{template.icon}</span>
              <div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription className="mt-1">
                  {template.description}
                </CardDescription>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-3">
            <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', categoryColor)}>
              {template.category}
            </span>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{template.fightersCount} fighters</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Button
            onClick={() => onUse(template)}
            disabled={isUsing}
            className="w-full"
            size="sm"
          >
            {isUsing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Création...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Utiliser ce template
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
