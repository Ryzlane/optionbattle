import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

export default function BadgeNotification({ badge, onClose }) {
  const { playAchievement } = useSound();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Jouer le son d'achievement
    playAchievement();

    // Arrêter les confettis après 3 secondes
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    // Auto-fermer après 5 secondes
    const closeTimer = setTimeout(() => {
      onClose?.();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  if (!badge) return null;

  return (
    <>
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Notification */}
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Trophy Icon */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-battle-secondary to-battle-primary rounded-full mb-4 shadow-lg"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Badge débloqué ! 🎉
            </h2>

            {/* Badge */}
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-battle-secondary/10 to-battle-primary/10 rounded-lg border-2 border-battle-secondary/20 mb-4">
              <span className="text-4xl">{badge.icon}</span>
              <div className="text-left">
                <h3 className="font-bold text-lg text-slate-900">{badge.name}</h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            </div>

            {/* Close hint */}
            <p className="text-xs text-muted-foreground">
              Cliquez n'importe où pour fermer
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
