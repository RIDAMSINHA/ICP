import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, logout, checkAdminStatus } from '../services/auth';
import '../styles/NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setAuthenticated(authStatus);
      
      if (authStatus) {
        // Only check admin status if authenticated
        const adminStatus = await checkAdminStatus();
        setIsAdmin(adminStatus);
      }
    };
    
    checkAuth();
  }, [location]);

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setIsAdmin(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link to="/" onClick={closeMenu}>
            <span className="logo-text">Green Gauge</span>
          </Link>
        </div>
        
        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="toggle-icon"></span>
          <span className="toggle-icon"></span>
          <span className="toggle-icon"></span>
        </div>
        
        <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''} 
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          
          {authenticated ? (
            <>
              <li className="navbar-item">
                <Link 
                  to="/dashboard" 
                  className={location.pathname === '/dashboard' ? 'active' : ''} 
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              </li>
              <li className="navbar-item">
                <Link 
                  to="/carbon-market" 
                  className={location.pathname === '/carbon-market' ? 'active' : ''} 
                  onClick={closeMenu}
                >
                  Carbon Market
                </Link>
              </li>
              {isAdmin && (
                <li className="navbar-item">
                  <Link 
                    to="/admin" 
                    className={location.pathname === '/admin' ? 'active' : ''} 
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                </li>
              )}
              <li className="navbar-item">
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link 
                  to="/login" 
                  className={location.pathname === '/login' ? 'active' : ''} 
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link 
                  to="/register" 
                  className={`navbar-button ${location.pathname === '/register' ? 'active' : ''}`} 
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar; 