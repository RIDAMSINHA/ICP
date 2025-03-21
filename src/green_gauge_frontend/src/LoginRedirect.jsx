import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home');  // Redirect to home after a brief delay
        }, 3000);  // Adjust the delay as needed (3000 ms = 3 seconds)

        return () => clearTimeout(timer);  // Cleanup the timer
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-bold">You are already logged in!</h2>
                <p className="mt-4">You will be redirected to the Home page shortly.</p>
            </div>
        </div>
    );
};

export default LoginRedirect;
