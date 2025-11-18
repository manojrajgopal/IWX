import React from 'react';
import { motion } from 'framer-motion';
import Container from '../layouts/Container';
import './SustainabilitySection.css';

const SustainabilitySection = ({
  title = "Our Commitment to Sustainability",
  description,
  features = [],
  stats = [],
  ctaText,
  onCtaClick,
  className = ''
}) => {
  return (
    <section className={`sustainability ${className}`}>
      <Container>
        <motion.div
          className="sustainability-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2>{title}</h2>
          {description && <p>{description}</p>}

          {stats && stats.length > 0 && (
            <div className="sustainability-stats">
              {stats.map((stat, index) => (
                <div key={index} className="sust-stat">
                  <h4>{stat.value}</h4>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {features && features.length > 0 && (
            <div className="sustainability-features">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="sustainability-item"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          )}

          {ctaText && onCtaClick && (
            <button className="cta-button" onClick={onCtaClick}>
              {ctaText}
            </button>
          )}
        </motion.div>
      </Container>
    </section>
  );
};

export default SustainabilitySection;
