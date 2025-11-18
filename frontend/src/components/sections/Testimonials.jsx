import React from 'react';
import { motion } from 'framer-motion';
import Rating from '../Rating';

const Testimonials = ({ testimonials }) => {
  return (
    <section className="testimonials">
      <div className="container">
        <h2>WHAT OUR CUSTOMERS SAY</h2>
        <p className="section-subtitle">Hear from those who have experienced IWX</p>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="testimonial-content">
                <div className="rating">
                  <Rating rating={testimonial.rating} />
                </div>
                <p>"{testimonial.comment}"</p>
              </div>
              <div className="testimonial-author">
                <img src={testimonial.avatar} alt={testimonial.name} />
                <div>
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
