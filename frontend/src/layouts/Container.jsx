import React from 'react';
import './Container.css';

const Container = ({ children, size = 'default', className = '' }) => {
  return (
    <div className={`container ${size} ${className}`}>
      {children}
    </div>
  );
};

export default Container;
