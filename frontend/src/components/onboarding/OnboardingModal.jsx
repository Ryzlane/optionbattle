import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Swords, Users, Trophy, Zap } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Button } from '../ui/Button';

const ONBOARDING_STEPS = [
  {
    icon: Swords,
    title: 'Bienvenue sur OptionBattle !',
    description: 'Transformez vos décisions difficiles en batailles épiques. Laissez vos options se battre pour déterminer le meilleur choix !',
    image: null
  },
  {
    icon: Zap,
    title: 'Créez votre première Battle',
    description: 'Donnez un titre à votre dilemme, puis ajoutez des Fighters (vos options). Chaque Fighter peut avoir des arguments pour (Powers) et contre (Weaknesses).',
    tips: ['Ajoutez au moins 2 Fighters', 'Pondérez vos arguments de 1 à 5', 'Le score total détermine le champion']
  },
  {
    icon: Users,
    title: 'Collaborez avec d\'autres',
    description: 'Invitez des amis, collègues ou famille à participer ! Créez des Arènes partagées pour prendre des décisions en groupe.',
    tips: ['Partagez via email ou lien', 'Donnez des rôles (Editor/Viewer)', 'Suivez les modifications en temps réel']
  },
  {
    icon: Trophy,
    title: 'Trouvez votre Champion',
    description: 'Une fois tous les arguments ajoutés, terminez la battle pour découvrir le Fighter gagnant basé sur les scores cumulés.',
    tips: ['Le champion a le score le plus élevé', 'Vous pouvez toujours rouvrir une battle', 'Archivez les battles terminées']
  }
];

export default function OnboardingModal({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="py-8 px-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-battle-primary to-battle-secondary rounded-full flex items-center justify-center">
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-4">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-center text-slate-600 mb-6 text-base sm:text-lg">
            {step.description}
          </p>

          {/* Tips */}
          {step.tips && (
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="font-medium text-slate-900 mb-2 text-sm">💡 Conseils :</p>
              <ul className="space-y-1">
                {step.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-slate-600 flex items-start">
                    <span className="text-battle-primary mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-battle-primary w-8'
                    : index < currentStep
                    ? 'bg-battle-primary/50'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {isLastStep ? 'Commencer' : 'Suivant'}
              {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Skip link */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-slate-900 transition-colors"
            >
              Passer l'introduction
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
