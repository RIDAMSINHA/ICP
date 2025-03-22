import React, { useState, useEffect } from 'react';
import { getAlerts, filterAlerts, updateAlertStatus, removeAlert } from './services/api';
import { formatDate, formatRelativeTime } from './utils/dateUtils';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // all, new, read, resolved
  const [loading, setLoading] = useState(true);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const result = await getAlerts();
      setAlerts(result);
      applyFilter(activeFilter, result);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filter, alertsData = alerts) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredAlerts(alertsData);
    } else {
      filterAlertsFromBackend(filter);
    }
  };

  const filterAlertsFromBackend = async (status) => {
    try {
      const filtered = await filterAlerts(status);
      setFilteredAlerts(filtered);
    } catch (error) {
      console.error("Error filtering alerts:", error);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await updateAlertStatus(alertId, 'resolved');
      
      // Update local state
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' } 
          : alert
      );
      
      setAlerts(updatedAlerts);
      applyFilter(activeFilter, updatedAlerts);
      setResolveModalOpen(false);
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await updateAlertStatus(alertId, 'read');
      
      // Update local state
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'read' } 
          : alert
      );
      
      setAlerts(updatedAlerts);
      applyFilter(activeFilter, updatedAlerts);
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await removeAlert(alertId);
      
      // Update local state
      const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
      setAlerts(updatedAlerts);
      applyFilter(activeFilter, updatedAlerts);
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  const openResolveModal = (alert) => {
    setSelectedAlert(alert);
    setResolveModalOpen(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">New</span>;
      case 'read':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Read</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Resolved</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-700">Alerts Dashboard</h1>
      <p className="text-gray-600 mb-6">Monitor and manage system alerts and notifications.</p>

      {/* Filter Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${activeFilter === 'all' ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-500'}`}
          onClick={() => applyFilter('all')}
        >
          All Alerts
        </button>
        <button
          className={`py-2 px-4 ${activeFilter === 'new' ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-500'}`}
          onClick={() => applyFilter('new')}
        >
          New
        </button>
        <button
          className={`py-2 px-4 ${activeFilter === 'read' ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-500'}`}
          onClick={() => applyFilter('read')}
        >
          Read
        </button>
        <button
          className={`py-2 px-4 ${activeFilter === 'resolved' ? 'text-green-600 border-b-2 border-green-600 font-medium' : 'text-gray-500'}`}
          onClick={() => applyFilter('resolved')}
        >
          Resolved
        </button>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No alerts found matching your filter criteria.</p>
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => applyFilter('all')}
          >
            View All Alerts
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg shadow-md bg-white border-l-4 ${
                alert.severity === 'high' 
                  ? 'border-red-500' 
                  : alert.severity === 'medium'
                  ? 'border-yellow-500'
                  : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold text-lg mr-2">Alert</h3>
                    {getStatusBadge(alert.status)}
                  </div>
                  <p className="text-gray-700 mb-2">{alert.message}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className={`font-medium ${getSeverityColor(alert.severity)} mr-2`}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Severity
                    </span>
                    <span>• {formatRelativeTime(alert.timestamp / 1000000)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {alert.status === 'new' && (
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => openResolveModal(alert)}
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModalOpen && selectedAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Resolve Alert</h2>
            <p className="mb-4">Are you sure you want to mark this alert as resolved?</p>
            <p className="p-3 bg-gray-100 rounded mb-4">{selectedAlert.message}</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setResolveModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => handleResolveAlert(selectedAlert.id)}
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
