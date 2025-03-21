import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import backend from './backendActor';

function Login({ setIsAuthenticated }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setIsAuthenticating(true);
      setError('');
      
      const authClient = await AuthClient.create();
      
      await authClient.login({
        identityProvider: process.env.NODE_ENV === 'production' 
          ? 'https://identity.ic0.app/' 
          : `http://127.0.0.1:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}`,
        onSuccess: async () => {
          setSuccess('Authentication successful! Redirecting...');
          setIsAuthenticated(true);
          
          // Try to register the user automatically
          try {
            await backend.register_user();
            console.log("User registered or already exists");
          } catch (err) {
            console.error("Auto-registration error:", err);
            // Continue even if registration fails
          }
          
          setTimeout(() => {
            navigate('/carbon');
          }, 1000);
          
          setIsAuthenticating(false);
        },
        onError: (error) => {
          setError('Authentication failed. Please try again.');
          setIsAuthenticating(false);
          console.error('Login error:', error);
        },
      });
    } catch (err) {
      console.error("Error during login:", err);
      setError('An error occurred during login. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const handleRegister = () => {
    navigate('/signup');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-bl from-green-500 to-yellow-50">
      <div className="flex flex-col md:flex-row items-center mt-40 bg-green-50 rounded-3xl p-10 shadow-xl">
        <div className="w-full md:w-1/2 px-6">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold text-center text-green-700 mb-6">
              Sign in to Green Gauge
            </h3>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-center mb-4">{success}</p>}
            
            <div className="space-y-6">
              <button
                onClick={handleLogin}
                disabled={isAuthenticating}
                className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                {isAuthenticating ? 'Authenticating...' : 'Sign in with Internet Identity'}
              </button>
              
              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    onClick={handleRegister} 
                    className="text-blue-600 hover:underline"
                  >
                    Register Now
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block md:w-1/2 px-6">
          <div className="bg-green-200 h-96 w-full flex items-center justify-center rounded-2xl shadow-xl">
            <div className="text-green-800 text-center p-6">
              <h2 className="text-2xl font-bold mb-4">Green Gauge Platform</h2>
              <p className="text-lg">Track and trade carbon credits to help combat climate change</p>
            </div>
          </div>
          <div className="mt-4 text-center text-gray-600 italic">
            "Reduce Emissions, Reimagine Our World."
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
