import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import backend from './backendActor';

function Signup() {
  const [principal, setPrincipal] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authClient = await AuthClient.create();
        if (await authClient.isAuthenticated()) {
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal().toString());
        }
      } catch (err) {
        setError('Failed to check authentication status');
        console.error('Auth check error:', err);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      setIsAuthenticating(true);
      setError('');
      const authClient = await AuthClient.create();
      
      // Use the correct identity provider based on environment
      const canisterId = process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai';
      const identityProvider = process.env.NODE_ENV === 'production'
        ? 'https://identity.ic0.app/'
        : `http://127.0.0.1:4943/?canisterId=${canisterId}`;
      
      console.log("Using identity provider:", identityProvider);
      
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal().toString());
          setIsAuthenticating(false);
        },
        onError: (error) => {
          setError('Authentication failed. Please try again.');
          setIsAuthenticating(false);
          console.error('Login error:', error);
        },
      });
    } catch (err) {
      setError('Failed to initialize authentication');
      setIsAuthenticating(false);
      console.error('Auth initialization error:', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Please enter a display name');
      return;
    }
    if (!principal) {
      setError('Please log in first');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log("Attempting to register user with principal:", principal);
      // First check if the user's session is valid
      const authClient = await AuthClient.create();
      if (!await authClient.isAuthenticated()) {
        throw new Error('Authentication session has expired. Please log in again.');
      }
      
      const response = await backend.register_user();
      console.log("Registration response:", response);
      
      if (response && response.Ok !== undefined) {
        setSuccess(`Account successfully registered!`);
        setCompanyName('');
        // Wait a moment to show the success message before redirecting
        setTimeout(() => {
          navigate('/carbon');
        }, 1500);
      } else if (response && response.Err) {
        // If there's a specific error from the backend
        throw new Error(response.Err);
      } else {
        throw new Error('Failed to register user');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // If the error contains "already registered", treat as success
      if (err.toString().includes("already registered")) {
        setSuccess(`Account verified! Redirecting...`);
        setTimeout(() => {
          navigate('/carbon');
        }, 1500);
      } else {
        setError(`Failed to register: ${err.message || err}`);
      }
      
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-green-500 to-yellow-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h3 className="text-2xl font-semibold text-green-700 mb-6 text-center">
          Register Your Account
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {!principal ? (
          <button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className={`w-full bg-blue-600 text-white py-2 rounded-lg transition-all ${
              isAuthenticating ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isAuthenticating ? 'Authenticating...' : 'Log in with Internet Identity'}
          </button>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your display name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-green-600 text-white py-2 rounded-lg transition-all ${
                loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Signup;
