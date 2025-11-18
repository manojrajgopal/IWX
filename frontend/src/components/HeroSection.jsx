import React from 'react';
import { motion } from 'framer-motion';
import Container from '../layouts/Container';
import './HeroSection.css';

const HeroSection = ({
  title,
  subtitle,
  backgroundImage,
  children,
  className = '',
  searchPlaceholder,
  onSearch,
  showSearch = false
}) => {
  return (
    <section
      className={`hero-section ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      <Container>
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
          {showSearch && (
            <motion.div
              className="hero-search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <input
                type="text"
                placeholder={searchPlaceholder || "Search..."}
                onChange={(e) => onSearch && onSearch(e.target.value)}
              />
              <button>Search</button>
            </motion.div>
          )}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
