import React from 'react';
import { motion } from 'framer-motion';

const CategoriesSection = ({ categories }) => {
  return (
    <section className="categories-section">
      <h2>SHOP BY CATEGORY</h2>
      <p className="section-subtitle">Discover our curated collections</p>
      <div className="categories-grid">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            className="category-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
          >
            <div
              className="category-image"
              style={{ backgroundImage: `url(${category.image})` }}
            >
              <div className="overlay"></div>
              <h3>{category.name}</h3>
              <button className="category-btn">Explore</button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
