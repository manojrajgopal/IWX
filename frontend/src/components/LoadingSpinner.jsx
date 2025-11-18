import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className="loading-container">
      <div className={`loading-spinner ${size}`}></div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
