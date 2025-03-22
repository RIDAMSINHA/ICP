import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from './assets/images/logo.png';

const NavigationBar = ({ isAuthenticated, setIsAuthenticated }) => {
    const [showModal, setShowModal] = useState(false);  // State to control modal visibility
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            // const response = await fetch('http://localhost:5000/logout', { method: 'POST', credentials: 'include' });
            // if (response.ok) {
            //     setIsAuthenticated(false);
            //     setShowModal(false);
            //     navigate('/');
            // } else {
            //     setShowModal(false);
            //     navigate('/');
            //     console.error("Logout failed.");
            // }
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setShowModal(false);
            navigate('/');
        } catch (error) {
            console.error("An error occurred during logout:", error);
        }
    };    

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="flex items-center p-5 fixed top-0 w-full bg-blue-100 shadow-md z-50">
                <img src={logo} alt="logo" className="h-12" />
                <ul className="flex justify-end px-5 w-full font-medium space-x-8 mx-10 text-lg">
                    <li><Link to="/home" className={isActive('/home') ? 'underline' : ''}>Home</Link></li>
                    <li>|</li>
                    <li><Link to="/dashboard" className={isActive('/dashboard') ? 'underline' : ''}>Dashboard</Link></li>
                    <li>|</li>
                    <li><Link to="/carbon" className={isActive('/carbon') ? 'underline' : ''}>Carbon Trading</Link></li>
                    <li>|</li>
                    <li><Link to="/profile" className={isActive('/profile') ? 'underline' : ''}>Profile</Link></li>
                    <li>|</li>
                    <li><Link to="/alerts" className={isActive('/alerts') ? 'underline' : ''}>Alerts</Link></li>
                    <li>|</li>
                    <li><Link to="/settings" className={isActive('/settings') ? 'underline' : ''}>Settings</Link></li>
                    <li>|</li>
                    {isAuthenticated ? (
                        <li><button onClick={() => setShowModal(true)} >Logout</button></li>
                    ) : (
                        <li><Link to="/login" className={isActive('/login') ? 'underline' : ''}>Login</Link></li>
                    )}
                </ul>
            </nav>

            {/* Logout Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                        <h3 className="text-xl font-semibold mb-4">Confirm Logout</h3>
                        <p className="mb-6">Are you sure you want to log out?</p>
                        <div className="flex justify-around">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={handleLogout}
                            >
                                Yes, Logout
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavigationBar;
