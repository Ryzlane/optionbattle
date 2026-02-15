import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook pour gérer les badges
 */
export function useBadges() {
  const [badges, setBadges] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState(null);

  const fetchBadges = useCallback(async () => {
    try {
      const response = await api.get('/badges/all');
      setBadges(response.data.data.badges);
      setUnlockedBadges(response.data.data.badges.filter(b => b.unlocked));
    } catch (error) {
      console.error('Erreur chargement badges:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkBadges = useCallback(async () => {
    try {
      const response = await api.post('/badges/check');
      const newBadges = response.data.data.newBadges;

      if (newBadges && newBadges.length > 0) {
        // Afficher le premier badge débloqué
        setNewBadge(newBadges[0]);
        // Recharger tous les badges
        fetchBadges();
      }
    } catch (error) {
      console.error('Erreur vérification badges:', error);
    }
  }, [fetchBadges]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const dismissBadgeNotification = () => {
    setNewBadge(null);
  };

  return {
    badges,
    unlockedBadges,
    loading,
    newBadge,
    checkBadges,
    dismissBadgeNotification,
    refetch: fetchBadges
  };
}
