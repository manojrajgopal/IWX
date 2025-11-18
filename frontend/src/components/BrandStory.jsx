import React from 'react';
import { motion } from 'framer-motion';
import Container from '../layouts/Container';
import './BrandStory.css';

const BrandStory = ({
  title = "InfiniteWaveX",
  subtitle = "Shaping Dreams with Timeless Waves",
  description,
  image,
  stats = [],
  className = ''
}) => {
  return (
    <section className={`brand-story ${className}`}>
      <Container>
        <div className="brand-content">
          <motion.div
            className="brand-text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2>{title}</h2>
            <h3>{subtitle}</h3>
            {description && <p>{description}</p>}
            {stats && stats.length > 0 && (
              <div className="brand-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat">
                    <h4>{stat.value}</h4>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          {image && (
            <motion.div
              className="brand-image"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <img src={image} alt={title} />
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default BrandStory;
