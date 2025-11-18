import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';

const FeaturedProducts = ({ products, loading }) => {
  return (
    <section className="featured-products">
      <div className="container">
        <div className="section-header">
          <h2>FEATURED PRODUCTS</h2>
          <p className="section-subtitle">Our most popular items this season</p>
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
                  product={product}
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

export default FeaturedProducts;
