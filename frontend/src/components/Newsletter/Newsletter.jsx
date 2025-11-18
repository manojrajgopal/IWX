import React from 'react';
import { motion } from 'framer-motion';

const Newsletter = () => {
  return (
    <section className="newsletter">
      <motion.div
        className="newsletter-content"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2>JOIN THE IWX COMMUNITY</h2>
        <p>Subscribe to receive updates, access to exclusive deals, and be the first to know about new collections.</p>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email address" />
          <button>SUBSCRIBE</button>
        </div>
        <p className="newsletter-note">By subscribing, you agree to our Terms and Privacy Policy.</p>
      </motion.div>
    </section>
  );
};

export default Newsletter;
