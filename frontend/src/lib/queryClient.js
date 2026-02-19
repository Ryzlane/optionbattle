import { QueryClient } from '@tanstack/react-query';

/**
 * Configuration globale de React Query pour OptionBattle
 *
 * Cache strategy:
 * - staleTime: 10 minutes - Les données restent "fresh" pendant 10 min
 * - gcTime: 15 minutes - Les données inutilisées sont gardées en cache 15 min
 * - refetchOnWindowFocus: false - Pas de refetch automatique au focus (WebSocket gère la sync)
 * - retry: 1 - Réessayer 1 fois en cas d'échec
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Données considérées fresh pendant 10 minutes
      staleTime: 10 * 60 * 1000,

      // Garbage collection après 15 minutes d'inactivité
      gcTime: 15 * 60 * 1000,

      // Pas de refetch au focus (WebSocket sync en temps réel)
      refetchOnWindowFocus: false,

      // Pas de refetch au reconnect (WebSocket gère déjà)
      refetchOnReconnect: false,

      // Réessayer 1 fois en cas d'erreur
      retry: 1,

      // Interval de retry: 1 seconde
      retryDelay: 1000,
    },
    mutations: {
      // Réessayer 0 fois pour les mutations (échec immédiat)
      retry: 0,
    },
  },
});
