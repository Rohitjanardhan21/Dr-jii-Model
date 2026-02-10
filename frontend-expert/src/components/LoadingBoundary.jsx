import React, { Suspense, useState, useEffect, useRef } from 'react';
import PageLoader from './PageLoader';

// Store minimum load promises by path to avoid creating new ones
const minLoadPromises = new Map();

/**
 * Utility function to create a promise that resolves after 2 seconds
 */
const createMinimumLoadPromise = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
};

/**
 * MinimumLoadingWrapper - Enforces minimum 2-second loading duration
 * This component delays showing the actual content for at least 2 seconds
 */
const MinimumLoadingWrapper = ({ children }) => {
  const [hasWaited, setHasWaited] = useState(false);
  const pathRef = useRef(window.location.pathname);
  const promiseRef = useRef(null);

  useEffect(() => {
    // Reset when path changes
    pathRef.current = window.location.pathname;
    setHasWaited(false);
    
    // Create promise for this load if it doesn't exist
    if (!promiseRef.current) {
      promiseRef.current = createMinimumLoadPromise();
    }

    promiseRef.current.then(() => {
      setHasWaited(true);
      promiseRef.current = null;
    });

    return () => {
      // Cleanup on unmount
      promiseRef.current = null;
    };
  }, []);

  // Throw promise only on first render if time hasn't passed
  if (!hasWaited && promiseRef.current) {
    throw promiseRef.current;
  }

  return children;
};

/**
 * LoadingBoundary - Wraps routes with a minimum loading duration
 * Ensures PageLoader displays for at least 2 seconds before showing content
 */
const LoadingBoundary = ({ children }) => {
  return (
    <Suspense fallback={<PageLoader />}>
      <MinimumLoadingWrapper>
        {children}
      </MinimumLoadingWrapper>
    </Suspense>
  );
};

export default LoadingBoundary;
