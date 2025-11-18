import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Notification.css';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  return (
    <AnimatePresence>
      <motion.div
        className={`notification ${type}`}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
      >
        <p>{message}</p>
        {onClose && (
          <button className="notification-close" onClick={onClose}>
            ×
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;
