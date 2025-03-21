import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getPrincipal } from '../services/auth';
import { checkAdminStatus, getAllUsers } from '../services/api';
import TokenReward from '../components/TokenReward';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [authenticated, setAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [principal, setPrincipal] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        setAuthenticated(authStatus);
        
        if (authStatus) {
          const userPrincipal = await getPrincipal();
          setPrincipal(userPrincipal);
          await checkAdmin();
        }
      } catch (err) {
        console.error('Authentication check error:', err);
        setError('Failed to verify authentication status');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const checkAdmin = async () => {
    try {
      const adminStatus = await checkAdminStatus();
      
      if (adminStatus.Ok !== undefined) {
        setIsAdmin(adminStatus.Ok);
        
        if (adminStatus.Ok) {
          // Load admin data
          fetchAllUsers();
        }
      } else if (adminStatus.Err) {
        setError(adminStatus.Err);
      }
    } catch (err) {
      console.error('Admin status check error:', err);
      setError('Failed to verify admin status');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const result = await getAllUsers();
      
      if (result.Ok) {
        setUsers(result.Ok);
      } else if (result.Err) {
        setError(result.Err);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user data');
    }
  };

  const handleTokensRewarded = () => {
    // Refresh user list after tokens are rewarded
    fetchAllUsers();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (authenticated === false) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin && !loading) {
    return (
      <div className="access-denied">
        <h1>Access Denied</h1>
        <p>You do not have admin privileges to access this page.</p>
        <a href="/dashboard" className="back-link">Return to Dashboard</a>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage the Green Gauge platform</p>
      </div>

      {error && <div className="admin-dashboard-error">{error}</div>}

      <div className="admin-dashboard-content">
        <div className="admin-section">
          <h2>System Overview</h2>
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{users.length}</p>
            </div>
            <div className="stat-card">
              <h3>Admin Principal</h3>
              <p className="admin-principal">{principal}</p>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <h2>User Management</h2>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Principal</th>
                  <th>Carbon Allowance</th>
                  <th>Carbon Emitted</th>
                  <th>Token Balance</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td className="principal-cell">{user.principal}</td>
                    <td>{user.carbonAllowance} units</td>
                    <td>{user.carbonEmitted} units</td>
                    <td>{user.tokenBalance} tokens</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="no-users-message">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-section">
          <h2>Reward Tokens</h2>
          <TokenReward onTokensRewarded={handleTokensRewarded} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 