import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Logo.css';

const Logo = () => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 10000); // 10 seconds total animation

    return () => clearTimeout(timer);
  }, []);

  // Container animation - scales down from full screen
  const containerVariants = {
    initial: { scale: 10, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.5
      }
    }
  };

  // Child elements animation - fade in
  const itemVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" }
    }
  };

  return (
    <div className="logo-container">
      <motion.div
        className="logo"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        style={animationComplete ? {} : undefined}
      >
        {/* Top arch text */}
        <motion.div
          className="top-arch-text"
          variants={itemVariants}
        >
          <span>S</span>
          <span>I</span>
          <span>N</span>
          <span>C</span>
          <span>E</span>
          <span>&nbsp;</span>
          <span>2</span>
          <span>0</span>
          <span>2</span>
          <span>5</span>
        </motion.div>

        {/* Center section */}
        <motion.div
          className="center-section"
          variants={itemVariants}
        >
          <div className="diamond-star">◆</div>
          <div className="center-i">I</div>
          <div className="diamond-star">◆</div>
        </motion.div>

        {/* Middle text with lines */}
        <motion.div
          className="middle-section"
          variants={itemVariants}
        >
          <div className="line"></div>
          <div className="iwx-text">IWX</div>
          <div className="line"></div>
        </motion.div>

        {/* Bottom arch text */}
        <motion.div
          className="bottom-arch-text"
          variants={itemVariants}
        >
          <span>S</span>
          <span>H</span>
          <span>A</span>
          <span>P</span>
          <span>I</span>
          <span>N</span>
          <span>G</span>
          <span>&nbsp;</span>
          <span>D</span>
          <span>R</span>
          <span>E</span>
          <span>A</span>
          <span>M</span>
          <span>S</span>
          <span>&nbsp;</span>
          <span>W</span>
          <span>I</span>
          <span>T</span>
          <span>H</span>
          <span>&nbsp;</span>
          <span>T</span>
          <span>I</span>
          <span>M</span>
          <span>E</span>
          <span>L</span>
          <span>E</span>
          <span>S</span>
          <span>S</span>
          <span>&nbsp;</span>
          <span>W</span>
          <span>A</span>
          <span>V</span>
          <span>E</span>
          <span>S</span>
        </motion.div>

        {/* Bottom stars */}
        <motion.div
          className="bottom-stars"
          variants={itemVariants}
        >
          <div className="star">◆</div>
          <div className="star large">◆</div>
          <div className="star">◆</div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Logo;
