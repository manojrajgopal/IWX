import React from 'react';
import { motion } from 'framer-motion';
import './StatsDisplay.css';

const StatsDisplay = ({
  stats = [],
  layout = 'horizontal', // 'horizontal' or 'grid'
  className = ''
}) => {
  if (layout === 'grid') {
    return (
      <div className={`stats-grid ${className}`}>
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="stat-item"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <h4>{stat.value}</h4>
            <p>{stat.label}</p>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`stats-horizontal ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="stat-item"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <h4>{stat.value}</h4>
          <p>{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsDisplay;
