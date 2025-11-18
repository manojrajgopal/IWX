import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Rating from './Rating';
import './ProductCard.css';

const ProductCard = ({
  product,
  showQuickView = true,
  showCategory = true,
  showRating = false,
  onQuickView,
  onAddToCart
}) => {
  const handleQuickView = (e) => {
    e.preventDefault();
    onQuickView && onQuickView(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    onAddToCart && onAddToCart(product);
  };

  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/productDetails/${product.id || product.product_id}`}>
        <div className="product-image">
          <img
            src={product.images?.[0] || product.image || '/placeholder.png'}
            alt={product.name}
            loading="lazy"
          />
          {showQuickView && (
            <button className="quick-view" onClick={handleQuickView}>
              Quick View
            </button>
          )}
          {showCategory && product.category && (
            <span className="product-category">{product.category}</span>
          )}
          {product.new && <span className="new-badge">NEW</span>}
          {product.sale_price && <span className="sale-badge">SALE</span>}
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          {showRating && product.rating && (
            <Rating rating={product.rating} />
          )}
          <div className="price-section">
            {product.sale_price ? (
              <>
                <span className="current-price">${product.sale_price.toFixed(2)}</span>
                <span className="original-price">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="current-price">${product.price ? product.price.toFixed(2) : 'N/A'}</span>
            )}
          </div>
        </div>
      </Link>
      {onAddToCart && (
        <button className="quick-add" onClick={handleAddToCart}>
          Quick Add
        </button>
      )}
    </motion.div>
  );
};

export default ProductCard;
