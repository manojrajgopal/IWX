import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event) => {
      if (isMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Toggle category dropdown
  const toggleCategory = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const categories = [
    {
      name: "WOMAN",
      image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
      subcategories: ["Dresses", "Tops", "Bottoms", "Outerwear", "Accessories"]
    },
    {
      name: "MAN",
      image: "https://images.unsplash.com/photo-1617137968429-3c386e5a2b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      subcategories: ["Shirts", "Pants", "Suits", "Outerwear", "Accessories"]
    },
    {
      name: "KIDS",
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      subcategories: ["Girls", "Boys", "Baby", "Shoes", "Accessories"]
    },
    {
      name: "BEAUTY",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80",
      subcategories: ["Skincare", "Makeup", "Fragrance", "Haircare", "Bodycare"]
    }
  ];

  return (
    <>
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <button
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
            {categories.map((category) => (
              <div
                key={category.name}
                className="nav-item"
                onMouseEnter={() => setActiveCategory(category.name)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <a href="#/" className="nav-link">{category.name}</a>
                <AnimatePresence>
                  {activeCategory === category.name && (
                    <motion.div
                      className="dropdown-menu"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {category.subcategories.map((subcat) => (
                        <a key={subcat} href="#/">{subcat}</a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </div>

        <div className="header-center">
          <div className="logo" onClick={() => navigate('/')}>
            <h1>IWX</h1>
            <p className="slogan">Designing Tomorrow, Today</p>
          </div>
        </div>


        <div className="header-right">
          <button className="user-btn desktop-only" onClick={() => navigate(isAuthenticated ? '/profile' : '/auth')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 0C4.03 0 0 4.03 0 9C0 13.97 4.03 18 9 18C13.97 18 18 13.97 18 9C18 4.03 13.97 0 9 0ZM9 4C10.66 4 12 5.34 12 7C12 8.66 10.66 10 9 10C7.34 10 6 8.66 6 7C6 5.34 7.34 4 9 4ZM9 16C6.67 16 4.61 14.94 3.33 13.33C3.94 12.01 5.59 11 7.5 11H10.5C12.41 11 14.06 12.01 14.67 13.33C13.39 14.94 11.33 16 9 16Z" fill="black"/>
            </svg>
          </button>
          <button className="cart-btn desktop-only" onClick={() => navigate('/cart')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M0 0H3.27L5.09 10.91H15.09L17 4H4.45L4.18 2H17V4H19L17.64 11.19C17.44 12.09 16.64 12.73 15.73 12.73H5.45C4.54 12.73 3.74 12.09 3.54 11.19L1.36 1.09L0 0ZM5.45 14C4.45 14 3.64 14.81 3.64 15.81C3.64 16.81 4.45 17.62 5.45 17.62C6.45 17.62 7.26 16.81 7.26 15.81C7.26 14.81 6.45 14 5.45 14ZM14.45 14C13.45 14 12.64 14.81 12.64 15.81C12.64 16.81 13.45 17.62 14.45 17.62C15.45 17.62 16.26 16.81 16.26 15.81C16.26 14.81 15.45 14 14.45 14Z" fill="black"/>
            </svg>
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <motion.div
        ref={mobileMenuRef}
        className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <button
          className="close-menu-btn"
          onClick={() => setIsMenuOpen(false)}
        >
          ✕
        </button>
        <nav>
          {categories.map((category) => (
            <div key={category.name} className="mobile-nav-item">
              <a href="#/" onClick={() => toggleCategory(category.name)}>
                {category.name}
                <span className="dropdown-arrow">{activeCategory === category.name ? '▲' : '▼'}</span>
              </a>
              {activeCategory === category.name && (
                <div className="mobile-dropdown">
                  {category.subcategories.map((subcat) => (
                    <a key={subcat} href="#/">{subcat}</a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Mobile User Actions */}
          <div className="mobile-user-actions">
            <button
              className="mobile-action-btn"
              onClick={() => {
                navigate(isAuthenticated ? '/profile' : '/auth');
                setIsMenuOpen(false);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 0C4.03 0 0 4.03 0 9C0 13.97 4.03 18 9 18C13.97 18 18 13.97 18 9C18 4.03 13.97 0 9 0ZM9 4C10.66 4 12 5.34 12 7C12 8.66 10.66 10 9 10C7.34 10 6 8.66 6 7C6 5.34 7.34 4 9 4ZM9 16C6.67 16 4.61 14.94 3.33 13.33C3.94 12.01 5.59 11 7.5 11H10.5C12.41 11 14.06 12.01 14.67 13.33C13.39 14.94 11.33 16 9 16Z" fill="black"/>
              </svg>
              {isAuthenticated ? 'Profile' : 'Login'}
            </button>
            <button
              className="mobile-action-btn"
              onClick={() => {
                navigate('/cart');
                setIsMenuOpen(false);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M0 0H3.27L5.09 10.91H15.09L17 4H4.45L4.18 2H17V4H19L17.64 11.19C17.44 12.09 16.64 12.73 15.73 12.73H5.45C4.54 12.73 3.74 12.09 3.54 11.19L1.36 1.09L0 0ZM5.45 14C4.45 14 3.64 14.81 3.64 15.81C3.64 16.81 4.45 17.62 5.45 17.62C6.45 17.62 7.26 16.81 7.26 15.81C7.26 14.81 6.45 14 5.45 14ZM14.45 14C13.45 14 12.64 14.81 12.64 15.81C12.64 16.81 13.45 17.62 14.45 17.62C15.45 17.62 16.26 16.81 16.26 15.81C16.26 14.81 15.45 14 14.45 14Z" fill="black"/>
              </svg>
              Cart
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </button>
          </div>
        </nav>
      </motion.div>
    </>
  );
};

export default Navbar;
