import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitaire pour combiner les classes Tailwind
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
