import { useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';

/**
 * Hook pour gérer l'auto-save avec debounce
 * @param {Function} saveFn - Fonction de sauvegarde
 * @param {any} data - Données à sauvegarder
 * @param {number} delay - Délai en ms (défaut: 3000)
 */
export function useAutoSave(saveFn, data, delay = 3000) {
  const debouncedSave = useRef(
    debounce(async (dataToSave) => {
      try {
        await saveFn(dataToSave);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, delay)
  ).current;

  useEffect(() => {
    if (data) {
      debouncedSave(data);
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [data, debouncedSave]);

  return debouncedSave;
}
