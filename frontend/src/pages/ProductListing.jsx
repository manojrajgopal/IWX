// ProductListing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { productAPI } from '../api/productAPI';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import Rating from '../components/Rating';
import ProductCard from '../components/ProductCard';
import Container from '../layouts/Container';
import { useCart } from '../hooks/useCart';
import { wishlistAPI } from '../api/wishlistAPI';
import './ProductListing.css';

const ProductListing = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.product_id === productId);
  };

  // Load wishlist items
  const loadWishlist = async () => {
    try {
      const wishlist = await wishlistAPI.getWishlist();
      setWishlistItems(wishlist.items || []);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId);
  };
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    size: [],
    color: [],
    price: []
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const filterRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load products from API
  useEffect(() => {
    loadProducts();
    loadWishlist();
  }, [activeFilters, selectedSort, currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const filters = {
        category: activeFilters.category.length > 0 ? activeFilters.category : undefined,
        sizes: activeFilters.size.length > 0 ? activeFilters.size : undefined,
        colors: activeFilters.color.length > 0 ? activeFilters.color : undefined,
        min_price: activeFilters.price.includes('under50') ? 0 :
                  activeFilters.price.includes('50to100') ? 50 :
                  activeFilters.price.includes('100to150') ? 100 : undefined,
        max_price: activeFilters.price.includes('under50') ? 50 :
                  activeFilters.price.includes('50to100') ? 100 :
                  activeFilters.price.includes('100to150') ? 150 :
                  activeFilters.price.includes('over150') ? undefined : undefined,
        skip: (currentPage - 1) * productsPerPage,
        limit: productsPerPage,
        sort_by: selectedSort === 'recommended' ? 'created_at' :
                selectedSort === 'priceLowHigh' ? 'price' :
                selectedSort === 'priceHighLow' ? 'price' :
                selectedSort === 'newest' ? 'created_at' :
                selectedSort === 'rating' ? 'rating' : 'created_at',
        sort_order: selectedSort === 'priceHighLow' ? '1' : '-1'
      };

      const response = await productAPI.getProducts(filters);
      setProducts(response.products);
      setFilteredProducts(response.products);
      setTotalProducts(response.total);
      setHasNext(response.has_next);
      setHasPrev(response.has_prev);
    } catch (error) {
      console.error('Failed to load products:', error);
      // No fallback to mock data - show empty state
      setProducts([]);
      setFilteredProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };


  // Remove client-side filtering since we're doing it server-side

  // Handle filter toggle
  const handleFilterToggle = (filterType, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      return newFilters;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      category: [],
      size: [],
      color: [],
      price: []
    });
    setSelectedSort('recommended');
  };

  // Use products directly since pagination is handled server-side
  const currentProducts = products;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle product click navigation
  const handleProductClick = (productId) => {
    navigate(`/productDetails/${productId}`);
  };

  // Handle quick view
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickViewModal(true);
  };

  // Handle add to cart
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      // Could show a success message here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };


  // Handle go to cart
  const handleGoToCart = (e) => {
    e.stopPropagation();
    navigate('/cart');
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e, product) => {
    e.stopPropagation();
    try {
      if (isInWishlist(product.id)) {
        // Remove from wishlist
        const item = wishlistItems.find(item => item.product_id === product.id);
        if (item) {
          await wishlistAPI.removeFromWishlist(item.id);
          setWishlistItems(prev => prev.filter(w => w.id !== item.id));
        }
      } else {
        // Add to wishlist
        await wishlistAPI.addToWishlist({
          product_id: product.id,
          quantity: 1
        });
        await loadWishlist(); // Refresh wishlist
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };


  // Filter options
  const filterOptions = {
    category: [
      { label: 'Woman', value: 'woman' },
      { label: 'Man', value: 'man' },
      { label: 'Kids', value: 'kids' },
      { label: 'Accessories', value: 'accessories' }
    ],
    size: [
      { label: 'XS', value: 'xs' },
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' }
    ],
    color: [
      { label: 'Black', value: 'black' },
      { label: 'White', value: 'white' },
      { label: 'Navy', value: 'navy' },
      { label: 'Beige', value: 'beige' },
      { label: 'Green', value: 'green' },
      { label: 'Red', value: 'red' }
    ],
    price: [
      { label: 'Under $50', value: 'under50' },
      { label: '$50 - $100', value: '50to100' },
      { label: '$100 - $150', value: '100to150' },
      { label: 'Over $150', value: 'over150' }
    ]
  };

  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Price: Low to High', value: 'priceLowHigh' },
    { label: 'Price: High to Low', value: 'priceHighLow' },
    { label: 'Newest', value: 'newest' },
    { label: 'Rating', value: 'rating' }
  ];

  return (
    <div className="product-listing-page">
      <Navbar />

      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Home', link: '/' },
        { label: 'Women', link: '/women' },
        { label: 'All Clothing' }
      ]} />

      {/* Banner */}
      <section className="plp-banner">
        <div className="container">
          <h1>Women's Collection</h1>
          <p>Discover the latest trends in women's fashion</p>
        </div>
      </section>

      {/* Filters and Sorting Bar */}
      <div className="filters-bar">
        <div className="container">
          <div className="filters-left">
            <button 
              className="filter-toggle"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filters
              <span className="filter-count">
                {Object.values(activeFilters).flat().length > 0 ? Object.values(activeFilters).flat().length : ''}
              </span>
            </button>
            
            <div className="active-filters">
              {activeFilters.category.map(filter => (
                <span key={filter} className="active-filter">
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <button onClick={() => handleFilterToggle('category', filter)}>×</button>
                </span>
              ))}
              {activeFilters.size.map(filter => (
                <span key={filter} className="active-filter">
                  Size: {filter.toUpperCase()}
                  <button onClick={() => handleFilterToggle('size', filter)}>×</button>
                </span>
              ))}
              {activeFilters.color.map(filter => (
                <span key={filter} className="active-filter">
                  Color: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <button onClick={() => handleFilterToggle('color', filter)}>×</button>
                </span>
              ))}
              {activeFilters.price.map(filter => (
                <span key={filter} className="active-filter">
                  {filterOptions.price.find(opt => opt.value === filter)?.label}
                  <button onClick={() => handleFilterToggle('price', filter)}>×</button>
                </span>
              ))}
              {Object.values(activeFilters).flat().length > 0 && (
                <button className="clear-filters" onClick={clearAllFilters}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="filters-right">
            <p className="results-count">{totalProducts} products</p>
            
            <div className="sort-dropdown" ref={filterRef}>
              <button 
                className="sort-toggle"
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                Sort: {sortOptions.find(opt => opt.value === selectedSort)?.label}
              </button>
              
              <AnimatePresence>
                {isSortOpen && (
                  <motion.div 
                    className="sort-options"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        className={selectedSort === option.value ? 'active' : ''}
                        onClick={() => {
                          setSelectedSort(option.value);
                          setIsSortOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="plp-container">
        <div className="container">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                className="filters-sidebar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="filter-group">
                  <h3>Category</h3>
                  {filterOptions.category.map(option => (
                    <label key={option.value} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={activeFilters.category.includes(option.value)}
                        onChange={() => handleFilterToggle('category', option.value)}
                      />
                      <span className="checkmark"></span>
                      {option.label}
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h3>Size</h3>
                  <div className="size-filters">
                    {filterOptions.size.map(option => (
                      <button
                        key={option.value}
                        className={`size-filter ${activeFilters.size.includes(option.value) ? 'active' : ''}`}
                        onClick={() => handleFilterToggle('size', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h3>Color</h3>
                  {filterOptions.color.map(option => (
                    <label key={option.value} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={activeFilters.color.includes(option.value)}
                        onChange={() => handleFilterToggle('color', option.value)}
                      />
                      <span className="checkmark"></span>
                      {option.label}
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h3>Price</h3>
                  {filterOptions.price.map(option => (
                    <label key={option.value} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={activeFilters.price.includes(option.value)}
                        onChange={() => handleFilterToggle('price', option.value)}
                      />
                      <span className="checkmark"></span>
                      {option.label}
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h3>Sustainability</h3>
                  <label className="filter-checkbox">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    Sustainable materials
                  </label>
                </div>

                <button className="apply-filters" onClick={() => setIsFilterOpen(false)}>
                  Apply Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="products-grid-container">
            {loading ? (
              <LoadingSpinner message="Loading products..." />
            ) : currentProducts.length > 0 ? (
              <>
                <div className="products-grid">
                  {currentProducts.map(product => (
                    <motion.div
                      key={product.id}
                      className="product-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: currentProducts.indexOf(product) * 0.1 }}
                      whileHover={{ y: -5 }}
                      onClick={() => handleProductClick(product.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="product-image">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                        <button
                          className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                          onClick={(e) => handleWishlistToggle(e, product)}
                        >
                          {isInWishlist(product.id) ? '❤️' : '🤍'}
                        </button>

                        {product.sale_price && (
                          <span className="sale-badge">SALE</span>
                        )}
                        {product.status === 'draft' && (
                          <span className="new-badge">DRAFT</span>
                        )}
                        {product.is_sustainable && (
                          <span className="eco-badge">ECO</span>
                        )}

                        <div className="product-actions">
                          <button className="quick-view" onClick={(e) => { e.stopPropagation(); handleQuickView(product); }}>Quick View</button>
                          <button
                            className="add-to-bag"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isInCart(product.id)) {
                                handleGoToCart(e);
                              } else {
                                handleAddToCart(e, product);
                              }
                            }}
                          >
                            {isInCart(product.id) ? 'Go to Bag' : 'Add to Bag'}
                          </button>
                        </div>
                      </div>

                      <div className="product-info">
                        <div className="product-meta">
                          {product.is_trending && (
                            <span className="trending">Trending</span>
                          )}
                          <span className="product-name">{product.name}</span>
                        </div>

                        <div className="product-price">
                          {product.sale_price ? (
                            <>
                              <span className="sale-price">${product.sale_price}</span>
                              <span className="original-price">${product.price}</span>
                            </>
                          ) : (
                            <span>${product.price}</span>
                          )}
                        </div>

                        <div className="product-colors">
                          <span className="color-dot" style={{ backgroundColor: product.colors && product.colors.length > 0 ? product.colors[0].toLowerCase() : '#000' }}></span>
                          <span>+{product.colors ? product.colors.length : 0} colors</span>
                        </div>

                        <div className="product-rating">
                          <Rating rating={product.rating || 0} />
                          <span>({product.review_count || 0})</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className={`pagination-btn ${!hasPrev ? 'disabled' : ''}`}
                      onClick={() => hasPrev && paginate(currentPage - 1)}
                      disabled={!hasPrev}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => paginate(page)}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className={`pagination-btn ${!hasNext ? 'disabled' : ''}`}
                      onClick={() => hasNext && paginate(currentPage + 1)}
                      disabled={!hasNext}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-products">
                <h2>No products found</h2>
                <p>Try adjusting your filters to see more results</p>
                <button className="clear-filters-btn" onClick={clearAllFilters}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="plp-newsletter">
        <div className="container">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for exclusive updates and offers</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="recently-viewed">
        <div className="container">
          <h2>Recently Viewed</h2>
          <div className="viewed-products">
            {products.slice(0, 5).map(product => (
              <div key={`recent-${product.id}`} className="viewed-product">
                <img
                  src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
                <div>
                  <p>{product.name}</p>
                  <span>${product.sale_price ? product.sale_price : product.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickViewModal && selectedProduct && (
          <>
            <motion.div
              className="quick-view-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickViewModal(false)}
            />
            <motion.div
              className="quick-view-modal"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="quick-view-content">
                <button
                  className="quick-view-close"
                  onClick={() => setShowQuickViewModal(false)}
                >
                  ×
                </button>

                <div className="quick-view-image">
                  <img
                    src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0] : '/placeholder.png'}
                    alt={selectedProduct.name}
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                </div>

                <div className="quick-view-details">
                  <h2>{selectedProduct.name}</h2>

                  <div className="quick-view-price">
                    {selectedProduct.sale_price ? (
                      <>
                        <span className="sale-price">${selectedProduct.sale_price}</span>
                        <span className="original-price">${selectedProduct.price}</span>
                      </>
                    ) : (
                      <span>${selectedProduct.price}</span>
                    )}
                  </div>

                  <div className="quick-view-rating">
                    <Rating rating={selectedProduct.rating || 0} />
                    <span>({selectedProduct.review_count || 0} reviews)</span>
                  </div>

                  <div className="quick-view-description">
                    <p>{selectedProduct.description || 'No description available.'}</p>
                  </div>

                  <div className="quick-view-colors">
                    <h4>Available Colors:</h4>
                    <div className="color-options">
                      {selectedProduct.colors && selectedProduct.colors.map((color, index) => (
                        <span
                          key={index}
                          className="color-option"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="quick-view-actions">
                    <button className="add-to-cart-btn">Add to Cart</button>
                    <button
                      className="view-details-btn"
                      onClick={() => {
                        navigate(`/productDetails/${selectedProduct.id}`);
                        setShowQuickViewModal(false);
                      }}
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductListing;
