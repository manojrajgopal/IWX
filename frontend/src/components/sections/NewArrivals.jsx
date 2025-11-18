import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';

const NewArrivals = ({ products, loading }) => {
  return (
    <section className="new-arrivals">
      <div className="container">
        <div className="section-header">
          <h2>NEW ARRIVALS</h2>
          <p className="section-subtitle">Fresh styles just arrived</p>
          <a href="#/" className="view-all">VIEW ALL</a>
        </div>

        <div className="products-grid">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="product-card loading">
                <div className="product-image skeleton"></div>
                <div className="product-info">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard
                  product={{...product, new: true}}
                  showCategory={true}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;