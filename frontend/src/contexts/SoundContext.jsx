import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SoundContext = createContext();

/**
 * Générateur de sons avec Web Audio API
 */
class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**
   * Jouer une note
   */
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return;

    this.init();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Son de succès (battle créée, fighter ajouté)
   */
  playSuccess() {
    this.playTone(523.25, 0.1, 'sine', 0.2); // C5
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.25), 80); // E5
  }

  /**
   * Son de victoire (champion)
   */
  playVictory() {
    this.playTone(392, 0.15, 'square', 0.2); // G4
    setTimeout(() => this.playTone(523.25, 0.15, 'square', 0.2), 100); // C5
    setTimeout(() => this.playTone(659.25, 0.2, 'square', 0.25), 200); // E5
    setTimeout(() => this.playTone(784, 0.3, 'square', 0.3), 300); // G5
  }

  /**
   * Son d'achievement (badge débloqué)
   */
  playAchievement() {
    this.playTone(523.25, 0.1, 'sine', 0.25); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.25), 80); // E5
    setTimeout(() => this.playTone(784, 0.1, 'sine', 0.25), 160); // G5
    setTimeout(() => this.playTone(1046.5, 0.25, 'sine', 0.3), 240); // C6
  }

  /**
   * Son d'action (ajout argument)
   */
  playAction() {
    this.playTone(440, 0.08, 'triangle', 0.15); // A4
  }

  /**
   * Son de clic subtil
   */
  playClick() {
    this.playTone(800, 0.05, 'square', 0.1);
  }

  /**
   * Son de suppression
   */
  playDelete() {
    this.playTone(200, 0.15, 'sawtooth', 0.2);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

const soundGenerator = new SoundGenerator();

export function SoundProvider({ children }) {
  // Charger la préférence depuis localStorage
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? saved === 'true' : true;
  });

  // Sauvegarder la préférence
  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled.toString());
    soundGenerator.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const playSuccess = useCallback(() => {
    if (soundEnabled) soundGenerator.playSuccess();
  }, [soundEnabled]);

  const playVictory = useCallback(() => {
    if (soundEnabled) soundGenerator.playVictory();
  }, [soundEnabled]);

  const playAchievement = useCallback(() => {
    if (soundEnabled) soundGenerator.playAchievement();
  }, [soundEnabled]);

  const playAction = useCallback(() => {
    if (soundEnabled) soundGenerator.playAction();
  }, [soundEnabled]);

  const playClick = useCallback(() => {
    if (soundEnabled) soundGenerator.playClick();
  }, [soundEnabled]);

  const playDelete = useCallback(() => {
    if (soundEnabled) soundGenerator.playDelete();
  }, [soundEnabled]);

  const value = {
    soundEnabled,
    toggleSound,
    playSuccess,
    playVictory,
    playAchievement,
    playAction,
    playClick,
    playDelete
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
}
