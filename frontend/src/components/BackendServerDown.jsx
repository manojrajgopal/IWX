// BackendServerDown.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BackendServerDown.css';

const BackendServerDown = () => {
  const [animationState, setAnimationState] = useState('initial');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setAnimationState('active');
  }, []);

  const errorDetails = {
    timestamp: new Date().toISOString(),
    errorCode: 'BACKEND_503',
    endpoint: '/api/v1/',
    service: 'Authentication Service',
    suggestedActions: [
      'Check if backend services are running',
      'Verify database connections',
      'Check API gateway status',
      'Review recent deployments'
    ]
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-animation">
          <ServerRackAnimation state={animationState} />
        </div>
        
        <h1 className="error-code">503</h1>
        <h2 className="error-title">Backend Services Unavailable</h2>
        <p className="error-message">
          Our backend services are currently undergoing maintenance or experiencing high traffic. 
          This affects features like user authentication, payments, and data processing.
        </p>

        {/* Service Status */}
        <div className="service-status">
          <div className="status-item">
            <span className="status-dot offline"></span>
            <span>Authentication Service</span>
          </div>
          <div className="status-item">
            <span className="status-dot offline"></span>
            <span>Database Service</span>
          </div>
          <div className="status-item">
            <span className="status-dot offline"></span>
            <span>Payment Gateway</span>
          </div>
          <div className="status-item">
            <span className="status-dot online"></span>
            <span>Static Content</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="error-actions">
          <motion.button
            className="btn-primary"
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry Connection
          </motion.button>
          
          <motion.button
            className="btn-secondary"
            onClick={() => window.open('/status', '_blank')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Check Status Page
          </motion.button>
        </div>

        {/* Error Details */}
        <details className="error-details">
          <summary>Technical Details</summary>
          <div className="details-content">
            <div className="detail-section">
              <h4>Error Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Error Code:</span>
                  <span className="detail-value">{errorDetails.errorCode}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Timestamp:</span>
                  <span className="detail-value">{errorDetails.timestamp}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Affected Service:</span>
                  <span className="detail-value">{errorDetails.service}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Endpoint:</span>
                  <span className="detail-value">{errorDetails.endpoint}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Suggested Actions</h4>
              <ul className="suggestions-list">
                {errorDetails.suggestedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <h4>Debug Information</h4>
              <pre className="debug-code">
{`Backend Health Check Failed:
- Database Connection: TIMEOUT
- Redis Cache: UNAVAILABLE
- Message Queue: OFFLINE
- API Gateway: 503 ERROR
- Last Successful Ping: ${new Date(Date.now() - 300000).toISOString()}`}
              </pre>
            </div>
          </div>
        </details>

        {/* Support Information */}
        <div className="support-section">
          <p>Our technical team has been notified and is working to resolve the issue.</p>
          <div className="support-links">
            <a href="/contact" className="support-link">Contact Support</a>
            <a href="/status" className="support-link">Service Status</a>
            <a href="/" className="support-link">Go Home</a>
          </div>
        </div>

        {/* Recovery Estimate */}
        <div className="recovery-estimate">
          <div className="estimate-content">
            <span className="estimate-icon">⏱️</span>
            <div>
              <span className="estimate-label">Estimated Recovery Time</span>
              <span className="estimate-time">15-30 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Server Rack Animation for Backend Down
const ServerRackAnimation = ({ state }) => {
  const [lights, setLights] = useState([false, false, false]);
  const [toolPosition, setToolPosition] = useState(0);

  useEffect(() => {
    if (state === 'active') {
      // Blinking server lights
      const lightInterval = setInterval(() => {
        setLights(prev => prev.map((_, i) => Math.random() > 0.5));
      }, 300);

      // Tool movement
      const toolInterval = setInterval(() => {
        setToolPosition(prev => (prev + 1) % 3);
      }, 2000);

      return () => {
        clearInterval(lightInterval);
        clearInterval(toolInterval);
      };
    }
  }, [state]);

  return (
    <motion.div
      className="server-animation"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="server-rack">
        <div className="server-unit">
          {lights.map((isOn, index) => (
            <motion.div
              key={index}
              className={`server-light ${isOn ? 'active' : ''}`}
              animate={{ opacity: isOn ? 1 : 0.3 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
        <motion.div
          className="repair-tool"
          animate={{ x: toolPosition * 40 - 40 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          🔧
        </motion.div>
      </div>
      <motion.div
        className="sparks"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="spark"
            animate={{
              y: [-10, -30],
              x: [-5 + i * 5, -10 + i * 10],
              opacity: [1, 0]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default BackendServerDown;
