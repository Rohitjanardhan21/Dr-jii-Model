import { useState, useEffect } from 'react';

/**
 * Hook to wrap lazy-loaded components with a minimum loading time
 * Ensures smooth transitions and prevents jarring immediate loads
 */
export const useMinimumLoadingTime = (minimumMs = 2000) => {
  const [hasMinimumTimePassed, setHasMinimumTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMinimumTimePassed(true);
    }, minimumMs);

    return () => clearTimeout(timer);
  }, [minimumMs]);

  return hasMinimumTimePassed;
};

/**
 * Wraps a lazy component and adds minimum loading time
 */
export const withMinimumLoadingTime = (lazyComponent, minimumMs = 2000) => {
  return (props) => {
    const hasMinimumTimePassed = useMinimumLoadingTime(minimumMs);
    
    if (!hasMinimumTimePassed) {
      throw new Promise(resolve => setTimeout(resolve, minimumMs));
    }

    return lazyComponent(props);
  };
};
