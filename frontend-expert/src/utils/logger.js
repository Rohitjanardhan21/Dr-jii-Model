/**
 * Development-only logging utility
 * Logs are only shown in development mode, not in production builds
 */
export const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args) => {
    // Always log errors, but format them properly
    console.error(...args);
  },
  warn: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args);
    }
  }
};

