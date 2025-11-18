import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AlertBox.css';

const AlertBox = ({ type = 'info', message, onClose, autoHide = true, duration = 5000 }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (autoHide) {
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - (100 / (duration / 50))));
      }, 50);

      // Auto hide timer
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [autoHide, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const getAlertIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '💡';
    }
  };

  const getAlertTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Notification';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`alert-box alert-${type}`}
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300 
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="alert-content">
            <div className="alert-icon">{getAlertIcon()}</div>
            <div className="alert-text">
              <h4 className="alert-title">{getAlertTitle()}</h4>
              <p className="alert-message">{message}</p>
            </div>
            <button 
              className="alert-close" 
              onClick={handleClose}
              aria-label="Close alert"
            >
              <motion.span
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                &times;
              </motion.span>
            </button>
          </div>
          
          {autoHide && (
            <div className="alert-progress">
              <motion.div 
                className="alert-progress-bar"
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertBox;
