import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from './backendActor';

const Logout = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // Clear any auth tokens or state
        localStorage.removeItem('userIsAuthenticated');
        setIsAuthenticated(false);
        // Redirect to home page
        navigate('/');
      } catch (error) {
        console.error("Error during logout:", error);
        // Still redirect even if there's an error
        navigate('/');
      }
    };

    performLogout();
  }, [navigate, setIsAuthenticated]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Logging out...</h2>
        <div className="loader mx-auto"></div>
      </div>
    </div>
  );
};

export default Logout; 