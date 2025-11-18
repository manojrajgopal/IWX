import React from 'react';
import { motion } from 'framer-motion';

const InstagramFeed = () => {
  return (
    <section className="instagram-feed">
      <h2>FOLLOW US ON INSTAGRAM</h2>
      <p className="section-subtitle">@InfiniteWaveX</p>
      <div className="instagram-grid">
        {[
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ].map((imageUrl, index) => (
          <motion.div
            key={index + 1}
            className="instagram-item"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <img src={imageUrl} alt={`Instagram post ${index + 1}`} />
            <div className="instagram-overlay">
              <span>❤️ {2 + index}.{index + 1}K</span>
              <span>💬 {(index + 1) * 23}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default InstagramFeed;
