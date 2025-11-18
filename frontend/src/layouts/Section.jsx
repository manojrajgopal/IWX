import React from 'react';
import { motion } from 'framer-motion';
import './Section.css';

const Section = ({
  children,
  className = '',
  background = 'white',
  padding = 'default',
  animate = true
}) => {
  const sectionContent = (
    <section className={`section ${background} ${padding} ${className}`}>
      {children}
    </section>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {sectionContent}
      </motion.div>
    );
  }

  return sectionContent;
};

export default Section;
