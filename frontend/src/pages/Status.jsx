import React from 'react';
import { useServerStatus } from '../hooks/useServerStatus';
import { useNavigate } from 'react-router-dom';
import './Status.css';

const Status = () => {
  const { backendStatus, frontendStatus, lastChecked, retryChecks, storedPath } = useServerStatus();
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'offline': return '#ff4444';
      case 'checking': return '#ff9800';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="status-page">
      <div className="status-container">
        <h1>Server Status</h1>
        <p>Check the current status of our services</p>

        <div className="status-grid">
          <div className="status-card">
            <h3>Backend Services</h3>
            <div className="status-indicator" style={{ backgroundColor: getStatusColor(backendStatus) }}>
              {getStatusText(backendStatus)}
            </div>
            <p>Last checked: {lastChecked ? lastChecked.toLocaleString() : 'Never'}</p>
          </div>

          <div className="status-card">
            <h3>Frontend Services</h3>
            <div className="status-indicator" style={{ backgroundColor: getStatusColor(frontendStatus) }}>
              {getStatusText(frontendStatus)}
            </div>
            <p>Network connectivity</p>
          </div>
        </div>

        <div className="status-actions">
          <button className="retry-btn" onClick={retryChecks}>
            Refresh Status
          </button>
          <button className="home-btn" onClick={() => navigate('/')}>
            Return to Homepage
          </button>
        </div>

        {storedPath && backendStatus === 'offline' && (
          <div className="stored-path-notice">
            <p><strong>Note:</strong> You were on <code>{storedPath}</code> when the backend went offline. You'll be automatically redirected there once it's back online.</p>
          </div>
        )}

        <div className="status-info">
          <h4>What does this mean?</h4>
          <ul>
            <li><strong>Online:</strong> All services are running normally.</li>
            <li><strong>Offline:</strong> Services are currently unavailable. Please try again later.</li>
            <li><strong>Checking:</strong> We're verifying the service status.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Status;
