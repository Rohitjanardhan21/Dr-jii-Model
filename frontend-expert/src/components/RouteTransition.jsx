import React, { useEffect, useState } from 'react';

/**
 * RouteTransition wrapper component
 * Helps manage loading states and transitions between routes
 */
const RouteTransition = ({ children }) => {
  useEffect(() => {
    // Force a layout recalculation to ensure smooth transitions
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        // Trigger reflow
        void document.documentElement.offsetHeight;
      });
    }
  }, []);

  return <>{children}</>;
};

export default RouteTransition;
