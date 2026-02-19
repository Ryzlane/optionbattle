import { MessageSquare } from 'lucide-react';
import FeedbackDialog from './FeedbackDialog';

export default function FloatingFeedbackButton() {
  return (
    <FeedbackDialog>
      <button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-battle-primary hover:bg-battle-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
        aria-label="Feedback"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Envoyer un feedback
        </span>
      </button>
    </FeedbackDialog>
  );
}
