import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './FAQAccordion.css';

const FAQAccordion = ({
  faqs = [],
  allowMultiple = false,
  className = ''
}) => {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems(prev => prev.includes(index) ? [] : [index]);
    }
  };

  return (
    <div className={`faq-accordion ${className}`}>
      {faqs.map((faq, index) => (
        <motion.div
          key={index}
          className="faq-item"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <button
            className={`faq-question ${openItems.includes(index) ? 'active' : ''}`}
            onClick={() => toggleItem(index)}
          >
            {faq.question}
            <span>{openItems.includes(index) ? '−' : '+'}</span>
          </button>
          <div className={`faq-answer ${openItems.includes(index) ? 'open' : ''}`}>
            <p>{faq.answer}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FAQAccordion;
