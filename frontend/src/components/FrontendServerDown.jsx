// FrontendServerDown.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './FrontendServerDown.css';

const FrontendServerDown = () => {
  const navigate = useNavigate();
  const [animationState, setAnimationState] = useState('initial');
  const [browserLights, setBrowserLights] = useState([false, false, false]);

  useEffect(() => {
    setAnimationState('active');
    
    // Blinking browser lights
    const lightInterval = setInterval(() => {
      setBrowserLights(prev => prev.map((_, i) => Math.random() > 0.5));
    }, 300);

    return () => clearInterval(lightInterval);
  }, []);

  const errorDetails = {
    timestamp: new Date().toISOString(),
    errorCode: 'FRONTEND_500',
    component: 'React Application',
    browser: navigator.userAgent,
    suggestedActions: [
      'Clear browser cache and cookies',
      'Try refreshing the page',
      'Check browser console for errors',
      'Try using a different browser',
      'Disable browser extensions temporarily'
    ]
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-animation">
          <BrowserCrashAnimation state={animationState} browserLights={browserLights} />
        </div>
        
        <h1 className="error-code">500</h1>
        <h2 className="error-title">Frontend Application Error</h2>
        <p className="error-message">
          Our web application is experiencing technical difficulties. 
          This might be due to a JavaScript error, failed resource loading, or compatibility issues.
        </p>

        {/* Browser Compatibility */}
        <div className="browser-compatibility">
          <div className="compatibility-title">Supported Browsers</div>
          <div className="browser-list">
            <div className="browser-item">
              <span className="browser-icon">🌐</span>
              <span>Chrome 90+</span>
            </div>
            <div className="browser-item">
              <span className="browser-icon">🌐</span>
              <span>Firefox 88+</span>
            </div>
            <div className="browser-item">
              <span className="browser-icon">🌐</span>
              <span>Safari 14+</span>
            </div>
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
            Reload Application
          </motion.button>
          
          <motion.button
            className="btn-secondary"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear & Reload
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
                  <span className="detail-label">Affected Component:</span>
                  <span className="detail-value">{errorDetails.component}</span>
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
{`Frontend Application Crash Report:
- Error: Application failed to mount
- Stack: TypeError: Cannot read properties of undefined
- Component: AppRouter
- Chunk: main.bundle.js (v2.1.4)
- Environment: production
- Build: #${Math.random().toString(36).substr(2, 8)}`}
              </pre>
            </div>
          </div>
        </details>

        {/* Support Information */}
        <div className="support-section">
          <p>If the problem persists, try these additional steps or contact support.</p>
          <div className="support-links">
            <a href="/contact" className="support-link">Contact Support</a>
            <a href="/help" className="support-link">Help Center</a>
            <a href="/" className="support-link">Home Page</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Browser Crash Animation
const BrowserCrashAnimation = ({ state, browserLights }) => {
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (state === 'active') {
      // Glitch effect
      const glitchInterval = setInterval(() => {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 200);
      }, 3000);

      // Particle effect
      const particleInterval = setInterval(() => {
        setParticles(Array.from({ length: 3 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100
        })));
        setTimeout(() => setParticles([]), 600);
      }, 4000);

      return () => {
        clearInterval(glitchInterval);
        clearInterval(particleInterval);
      };
    }
  }, [state]);

  return (
    <motion.div
      className="browser-crash-animation"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="browser-window">
        <div className="browser-header">
          <div className="browser-controls">
            <div className="control red"></div>
            <div className="control yellow"></div>
            <div className="control green"></div>
          </div>
          <div className="browser-url">https://yourapp.com</div>
        </div>
        <div className="browser-content">
          <motion.div
            className="loading-bar"
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <motion.div
            className="content-glitch"
            animate={{ 
              opacity: glitchEffect ? [1, 0.8, 1] : 1,
              x: glitchEffect ? [0, -3, 3, 0] : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="glitch-line"></div>
            <div className="glitch-line"></div>
            <div className="glitch-line"></div>
          </motion.div>
          
          <motion.div
            className="error-symbol"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity
            }}
          >
            ⚠️
          </motion.div>

          {/* Browser Status Lights */}
          <div className="browser-status">
            {browserLights.map((isActive, index) => (
              <motion.div
                key={index}
                className={`status-light ${isActive ? 'active' : ''}`}
                animate={{ opacity: isActive ? 1 : 0.3 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Error Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="error-particle"
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 1
            }}
            animate={{
              scale: 1,
              opacity: 0,
              x: particle.x + (Math.random() - 0.5) * 40,
              y: particle.y + (Math.random() - 0.5) * 40
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default FrontendServerDown;
