import { Navigate } from 'react-router-dom';
import { useDoctorAuthStore } from '../../store/useDoctorAuthStore';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const { checkDoctorAuth, doctor, isCheckingAuth } = useDoctorAuthStore();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // If we're already checking auth, don't start another check
        if (isCheckingAuth) return;

        // If we have doctor data in the store, we're authenticated
        if (doctor) {
          setIsAuthenticated(true);
          return;
        }

        const auth = await checkDoctorAuth();
        setIsAuthenticated(auth);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, [checkDoctorAuth, doctor, isCheckingAuth]);

  if (isAuthenticated === null || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0095D9]"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 