import React from 'react';
import { motion } from 'framer-motion';
import Container from '../layouts/Container';
import './CTASection.css';

const CTASection = ({
  title,
  subtitle,
  primaryButton,
  secondaryButton,
  backgroundImage,
  className = ''
}) => {
  return (
    <section
      className={`cta-section ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      <Container>
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}

          <div className="cta-buttons">
            {primaryButton && (
              <button
                className="cta-primary"
                onClick={primaryButton.onClick}
              >
                {primaryButton.text}
              </button>
            )}
            {secondaryButton && (
              <button
                className="cta-secondary"
                onClick={secondaryButton.onClick}
              >
                {secondaryButton.text}
              </button>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default CTASection;
