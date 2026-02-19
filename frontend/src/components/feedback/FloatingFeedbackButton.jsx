import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import FeedbackDialog from './FeedbackDialog';

export default function FloatingFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="flex items-center justify-center w-14 h-14 bg-battle-primary text-white rounded-full shadow-lg hover:bg-battle-secondary hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-battle-primary focus:ring-offset-2"
          aria-label="Envoyer un feedback"
        >
          <MessageSquare className="w-6 h-6" />
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-16 right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-md whitespace-nowrap shadow-lg">
            Envoyer un feedback
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-900 transform rotate-45"></div>
          </div>
        )}
      </div>

      {/* Dialog */}
      <FeedbackDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
