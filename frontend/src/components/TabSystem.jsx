import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../layouts/Container';
import './TabSystem.css';

const TabSystem = ({
  tabs = [],
  activeTab,
  onTabChange,
  title,
  className = ''
}) => {
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <section className={`tab-system ${className}`}>
      <Container>
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>
        )}

        <div className="tabs-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'tab-active' : ''}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          <AnimatePresence mode="wait">
            {activeTabData && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="tab-panel"
              >
                {activeTabData.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
};

export default TabSystem;
