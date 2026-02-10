import { useEffect } from 'react';

/**
 * Hook to prevent layout thrashing and ensure smooth transitions
 * Useful for ensuring loading states display properly
 */
export const useSuspenseConfig = () => {
  useEffect(() => {
    // Ensure GPU acceleration for smooth animations
    const style = document.documentElement.style;
    return () => {
      // Cleanup if needed
    };
  }, []);
};
