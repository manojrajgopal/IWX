import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ErrorPage.css';

const ErrorPage = ({ type = 'unexpected', message, details }) => {
  const navigate = useNavigate();
  const [animationState, setAnimationState] = useState('initial');

  useEffect(() => {
    setAnimationState('active');
  }, []);

  const getErrorContent = () => {
    switch (type) {
      case '404':
        return {
          code: '404',
          title: 'Page Not Found',
          message: 'The page you are looking for does not exist.',
          animation: <CompassAnimation state={animationState} />
        };
      case '500':
        return {
          code: '500',
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          animation: <ServerRepairAnimation state={animationState} />
        };
      case 'network':
        return {
          code: 'NETWORK',
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          animation: <NetworkAnimation state={animationState} />
        };
      case 'timeout':
        return {
          code: 'TIMEOUT',
          title: 'Request Timeout',
          message: 'The request took too long to complete. Please try again.',
          animation: <TimeoutAnimation state={animationState} />
        };
      default:
        return {
          code: 'ERROR',
          title: 'Unexpected Error',
          message: message || 'An unexpected error occurred.',
          animation: <UnexpectedAnimation state={animationState} />
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-animation">
          {errorContent.animation}
        </div>
        <h1 className="error-code">{errorContent.code}</h1>
        <h2 className="error-title">{errorContent.title}</h2>
        <p className="error-message">{errorContent.message}</p>

        {details && (
          <details className="error-details">
            <summary>Technical Details</summary>
            <pre>{details}</pre>
          </details>
        )}

        <div className="error-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Go Home
          </button>
          <button
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

// 404 - Compass Searching Animation
const CompassAnimation = ({ state }) => {
  const [needleRotation, setNeedleRotation] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    if (state === 'active') {
      // Needle searching animation
      const needleInterval = setInterval(() => {
        setNeedleRotation(prev => (prev + 45) % 360);
      }, 1500);

      // Pulse animation
      const pulseInterval = setInterval(() => {
        setPulseScale(prev => prev === 1 ? 1.1 : 1);
      }, 2000);

      return () => {
        clearInterval(needleInterval);
        clearInterval(pulseInterval);
      };
    }
  }, [state]);

  return (
    <motion.div 
      className="compass-animation"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      <div className="compass-outer">
        <motion.div 
          className="compass-pulse"
          animate={{ scale: pulseScale }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg viewBox="0 0 100 100" className="compass-svg">
          {/* Compass Circle */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
          
          {/* Directions */}
          <text x="50" y="20" textAnchor="middle" fontSize="8">N</text>
          <text x="80" y="53" textAnchor="middle" fontSize="8">E</text>
          <text x="50" y="85" textAnchor="middle" fontSize="8">S</text>
          <text x="20" y="53" textAnchor="middle" fontSize="8">W</text>
          
          {/* Needle */}
          <motion.g
            animate={{ rotate: needleRotation }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            transformOrigin="50 50"
          >
            <line x1="50" y1="20" x2="50" y2="80" stroke="#ff4444" strokeWidth="3"/>
            <circle cx="50" cy="50" r="5" fill="#ff4444"/>
          </motion.g>
        </svg>
      </div>
      <motion.div
        className="search-dots"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// 500 - Server Repair Animation
const ServerRepairAnimation = ({ state }) => {
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

// Network - Connection Animation
const NetworkAnimation = ({ state }) => {
  const [waves, setWaves] = useState([false, false, false]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (state === 'active') {
      const waveInterval = setInterval(() => {
        setWaves(prev => {
          const newWaves = [...prev];
          const randomIndex = Math.floor(Math.random() * 3);
          newWaves[randomIndex] = true;
          setTimeout(() => {
            setWaves(current => {
              const updated = [...current];
              updated[randomIndex] = false;
              return updated;
            });
          }, 500);
          return newWaves;
        });
      }, 800);

      // Simulate connection attempts
      const connectionInterval = setInterval(() => {
        setIsConnected(prev => !prev);
      }, 4000);

      return () => {
        clearInterval(waveInterval);
        clearInterval(connectionInterval);
      };
    }
  }, [state]);

  return (
    <motion.div
      className="network-animation"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="wifi-symbol">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className={`wifi-arc arc-${i}`}
            animate={{
              opacity: waves[i] ? 1 : 0.3,
              scale: waves[i] ? 1.1 : 1
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
        <motion.div
          className="connection-dot"
          animate={{
            scale: isConnected ? 1 : 0.5,
            backgroundColor: isConnected ? '#4CAF50' : '#ff4444'
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <motion.div
        className="signal-bars"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="signal-bar"
            animate={{
              height: waves[i] ? [10, 25, 10] : 10,
              opacity: waves[i] ? 1 : 0.5
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// Timeout - Hourglass Animation
const TimeoutAnimation = ({ state }) => {
  const [sandProgress, setSandProgress] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (state === 'active') {
      const sandInterval = setInterval(() => {
        setSandProgress(prev => {
          if (prev >= 100) {
            setIsFlipping(true);
            setTimeout(() => {
              setSandProgress(0);
              setIsFlipping(false);
            }, 1000);
            return 0;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(sandInterval);
    }
  }, [state]);

  return (
    <motion.div
      className="timeout-animation"
      animate={{ rotate: isFlipping ? 180 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="hourglass">
        <div className="hourglass-top">
          <motion.div
            className="sand"
            animate={{ height: `${100 - sandProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="hourglass-neck" />
        <div className="hourglass-bottom">
          <motion.div
            className="sand"
            animate={{ height: `${sandProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
      <motion.div
        className="time-text"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        ⏱️
      </motion.div>
    </motion.div>
  );
};

// Default - Unexpected Error Animation
const UnexpectedAnimation = ({ state }) => {
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (state === 'active') {
      // Shake animation
      const shakeInterval = setInterval(() => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }, 3000);

      // Particle effect
      const particleInterval = setInterval(() => {
        setParticles(Array.from({ length: 5 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100
        })));
        setTimeout(() => setParticles([]), 500);
      }, 2000);

      return () => {
        clearInterval(shakeInterval);
        clearInterval(particleInterval);
      };
    }
  }, [state]);

  return (
    <motion.div
      className="unexpected-animation"
      animate={{ x: shake ? [-5, 5, -5, 5, 0] : 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="error-symbol">
        <motion.div
          className="error-x x1"
          animate={{ rotate: 45 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="error-x x2"
          animate={{ rotate: -45 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="error-circle"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
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
              x: particle.x + (Math.random() - 0.5) * 50,
              y: particle.y + (Math.random() - 0.5) * 50
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        ))}
      </AnimatePresence>
      <motion.div
        className="question-mark"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ❓
      </motion.div>
    </motion.div>
  );
};

export default ErrorPage;
