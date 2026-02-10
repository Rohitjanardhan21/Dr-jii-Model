import React, { useState, useEffect } from 'react';
import './PageLoader.css';

const PageLoader = () => {
  const [hint, setHint] = useState('Loading');

  // Map routes to contextual loading hints
  const getLoadingHint = () => {
    const pathname = window.location.pathname;

    const routeHints = {
      '/dashboard': 'Loading dashboard',
      '/patients': 'Loading patients',
      '/invoices': 'Loading invoices',
      '/appointments': 'Loading appointments',
      '/medicine': 'Loading medicine',
      '/services': 'Loading services',
      '/prescription': 'Loading prescriptions',
      '/chat': 'Loading chat',
      '/facility': 'Loading facility',
      '/analytics': 'Loading analytics',
      '/orders': 'Loading orders',
      '/payments': 'Loading payments',
      '/campaigns': 'Loading campaigns',
      '/settings': 'Loading settings',
      '/doctors': 'Loading doctors',
      '/receptions': 'Loading receptions',
      '/support': 'Loading support',
      '/docare': 'Loading DoCare',
      '/editprofile': 'Loading profile',
      '/register': 'Loading registration',
    };

    for (const [route, hintText] of Object.entries(routeHints)) {
      if (pathname.includes(route)) {
        return hintText;
      }
    }

    return 'Loading';
  };

  useEffect(() => {
    setHint(getLoadingHint());
  }, []);

  return (
    <div className="page-loader-overlay">
      <div className="page-loader-card">
        {/* Glassy spinner */}
        <div className="page-loader-spinner">
          <div className="spinner-ring" />
          <div className="spinner-dot" />
        </div>

        {/* Contextual Loading Text */}
        <div className="page-loader-text">
          <p className="loading-hint">{hint}</p>
          <p className="loading-subtitle">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
