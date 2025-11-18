import React from 'react';
import { motion } from 'framer-motion';

const BlogSection = ({ blogs }) => {
  return (
    <section className="blog-section">
      <div className="container">
        <div className="section-header">
          <h2>FROM THE BLOG</h2>
          <p className="section-subtitle">Insights, trends, and inspiration</p>
          <a href="#/" className="view-all">VIEW ALL</a>
        </div>

        <div className="blog-grid">
          {blogs.map((blog, index) => (
            <motion.div
              key={index}
              className="blog-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="blog-image">
                <img src={blog.image} alt={blog.title} />
                <div className="blog-date">{blog.date}</div>
              </div>
              <div className="blog-content">
                <h3>{blog.title}</h3>
                <p>{blog.excerpt}</p>
                <a href="#/" className="read-more">Read More</a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
