import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar/Navbar';
import { productAPI } from '../api/productAPI';
import { cartAPI } from '../api/cartAPI';
import { wishlistAPI } from '../api/wishlistAPI';
import { addItemToCart } from '../redux/slices/cartSlice';
import virtualTryOnAPI from '../api/virtualTryOnAPI';
import './ProductDetails.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [currentMedia, setCurrentMedia] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);
  const [showGeneratedImages, setShowGeneratedImages] = useState(false);
  const [selectedGarmentImage, setSelectedGarmentImage] = useState(null);
  const [personImage, setPersonImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [virtualTryOnLoading, setVirtualTryOnLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generatedImagesLoading, setGeneratedImagesLoading] = useState(false);
  const fileInputRef = useRef(null);


  const relatedProducts = [
    {
      id: 2,
      name: 'Designer Silk Dress',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      category: 'Dresses'
    },
    {
      id: 3,
      name: 'Limited Edition Sneakers',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
      category: 'Footwear'
    },
    {
      id: 4,
      name: 'Cashmere Sweater',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
      category: 'Knitwear'
    },
    {
      id: 5,
      name: 'Designer Handbag',
      price: 179.99,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80',
      category: 'Accessories'
    }
  ];

  const reviews = [
    {
      id: 1,
      user: 'Sarah Johnson',
      rating: 5,
      date: '2025-05-15',
      comment: 'Absolutely love this jacket! The quality is exceptional and it fits perfectly. I get compliments every time I wear it.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
    },
    {
      id: 2,
      user: 'Michael Chen',
      rating: 4,
      date: '2025-05-10',
      comment: 'Great jacket overall. The leather is high quality and it has a nice weight to it. Runs slightly large, so consider sizing down.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
    },
    {
      id: 3,
      user: 'Emma Rodriguez',
      rating: 5,
      date: '2025-05-05',
      comment: 'Worth every penny! The craftsmanship is outstanding and it gets better with wear. Perfect for both casual and dressed-up occasions.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
    }
  ];

  const sizeGuide = {
    measurements: ['Chest', 'Length', 'Sleeve'],
    sizes: {
      XS: [38, 26, 24],
      S: [40, 27, 25],
      M: [42, 28, 26],
      L: [44, 29, 27],
      XL: [46, 30, 28]
    }
  };

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate('/error/404');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const productData = await productAPI.getProduct(id);
        if (!productData || !productData.id) {
          // Product not found, redirect to 404
          navigate('/error/404');
          return;
        }
        setProduct(productData);
        // Set default selections based on product data
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        // Reset media index when new product loads
        setCurrentMedia(0);
      } catch (err) {
        // Check if it's a 404 error (product not found)
        if (err.response?.status === 404) {
          navigate('/error/404');
          return;
        }
        // For other errors, show error state but don't log to console
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Check wishlist and cart status when product loads
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && product && product.id) {
        try {
          const result = await wishlistAPI.checkInWishlist(product.id, selectedSize, selectedColor);
          setIsWishlisted(result.in_wishlist);
        } catch (error) {
          console.error('Failed to check wishlist status:', error);
        }
      }
    };

    const checkCartStatus = async () => {
      if (user && product && product.id) {
        try {
          const cartResponse = await cartAPI.getCart();
          const itemInCart = cartResponse.items.some(item =>
            item.product_id === product.id &&
            item.size === selectedSize &&
            item.color === selectedColor
          );
          setIsInCart(itemInCart);
        } catch (error) {
          console.error('Failed to check cart status:', error);
        }
      }
    };

    const fetchGeneratedImages = async () => {
      if (product && product.id) {
        setGeneratedImagesLoading(true);
        try {
          const result = await virtualTryOnAPI.getImages(product.id);
          setGeneratedImages(result.images || []);
        } catch (error) {
          console.error('Failed to fetch generated images:', error);
          setGeneratedImages([]);
        } finally {
          setGeneratedImagesLoading(false);
        }
      }
    };

    checkWishlistStatus();
    checkCartStatus();
    fetchGeneratedImages();
  }, [user, product, selectedSize, selectedColor]);

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect to login or show login prompt
      navigate('/auth');
      return;
    }

    try {
      await dispatch(addItemToCart({
        productId: id,
        quantity,
        size: selectedSize,
        color: selectedColor
      })).unwrap();
      setIsInCart(true);
      setShowNotification(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show error notification
      setShowNotification(true);
      // You could set an error state here
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isWishlisted) {
        // Get wishlist to find the item ID
        const wishlist = await wishlistAPI.getWishlist();
        const item = wishlist.items.find(item =>
          item.product_id === id &&
          item.size === selectedSize &&
          item.color === selectedColor
        );
        if (item) {
          // Remove from wishlist using item ID
          await wishlistAPI.removeFromWishlist(item.id);
        }
      } else {
        // Add to wishlist
        await wishlistAPI.addToWishlist({
          product_id: id,
          size: selectedSize,
          color: selectedColor,
          quantity: 1
        });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleVirtualTryOn = async () => {
    if (!selectedGarmentImage || !personImage) return;

    setVirtualTryOnLoading(true);
    setResultImage(null);
    try {
      const response = await virtualTryOnAPI.tryOn(personImage, selectedGarmentImage, id);
      if (response.status === 'ok' && response.image_base64) {
        setResultImage(response.image_base64);
      } else {
        alert('Failed to generate virtual try on image. Please try again.');
      }
    } catch (error) {
      console.error('Virtual try on error:', error);
      alert('An error occurred during virtual try on. Please try again.');
    } finally {
      setVirtualTryOnLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? "star filled" : "star"}>★</span>
    ));
  };

  // Combine images, videos, and generated images for media gallery
  const getAllMedia = () => {
    if (!product) return [];
    const images = product.images || [];
    const videos = product.videos || [];
    const generated = generatedImages.map(img => img.image_base64) || [];
    return [...images, ...videos, ...generated];
  };

  // Check if current media is a video
  const isCurrentMediaVideo = () => {
    if (!product) return false;
    const imagesLen = product.images?.length || 0;
    const videosLen = product.videos?.length || 0;
    return currentMedia >= imagesLen && currentMedia < imagesLen + videosLen;
  };

  // Check if current media is a generated image
  const isCurrentMediaGenerated = () => {
    if (!product) return false;
    const imagesLen = product.images?.length || 0;
    const videosLen = product.videos?.length || 0;
    return currentMedia >= imagesLen + videosLen;
  };

  // Get current media URL
  const getCurrentMediaUrl = () => {
    const allMedia = getAllMedia();
    return allMedia[currentMedia] || '';
  };

  const shareOptions = [
    { name: 'Facebook', icon: '📘' },
    { name: 'Twitter', icon: '🐦' },
    { name: 'Pinterest', icon: '📌' },
    { name: 'Email', icon: '✉️' },
    { name: 'Copy Link', icon: '🔗' }
  ];

  if (loading) {
    return (
      <div className="product-detail-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="product-detail-container">
      <Navbar />

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <p>Item added to your bag!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <a href="#/">Home</a> / <a href="#/">Products</a> / <span>{product.name}</span>
        </div>
      </div>

      <div className="product-detail-content">
        <div className="container">
          <div className="product-main">
            {/* Product Media */}
            <div className="product-images">
              <div className="main-image" style={(showVirtualTryOn || showGeneratedImages) ? { cursor: 'default' } : {}}>
                {showVirtualTryOn ? (
                  <div className="virtual-try-on-interface">
                    <div className="virtual-try-on-header">
                      <h3>Virtual Try On</h3>
                      <button
                        className="close-btn"
                        onClick={() => setShowVirtualTryOn(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => setPersonImage(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <div className="result-image">
                      {resultImage ? (
                        <img
                          src={`data:image/jpeg;base64,${resultImage}`}
                          alt="Virtual Try On Result"
                          className={isZoomed ? 'zoomed' : ''}
                          onClick={() => setIsZoomed(!isZoomed)}
                          style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain', cursor: 'zoom-in' }}
                        />
                      ) : personImage ? (
                        <img
                          src={URL.createObjectURL(personImage)}
                          alt="Uploaded photo"
                          style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="placeholder clickable" onClick={() => fileInputRef.current.click()}>
                          {virtualTryOnLoading ? (
                            <div className="loading-spinner"></div>
                          ) : (
                            <>
                              <p>Select a garment and upload your photo to see the result</p>
                              <button className="upload-photo-btn">Upload Photo</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="garment-selection">
                      <h4>Select Garment</h4>
                      <div className="garment-thumbnails">
                        {product.images?.map((image, index) => (
                          <div
                            key={index}
                            className={`garment-thumbnail ${selectedGarmentImage === image ? 'active' : ''}`}
                            onClick={() => setSelectedGarmentImage(image)}
                          >
                            <img
                              src={image}
                              alt={`Garment ${index + 1}`}
                              onError={(e) => {
                                e.target.src = '/placeholder.png';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      className="try-on-btn"
                      onClick={handleVirtualTryOn}
                      disabled={!selectedGarmentImage || !personImage || virtualTryOnLoading}
                    >
                      {virtualTryOnLoading ? 'Processing...' : 'Try On'}
                    </button>
                  </div>
                ) : showGeneratedImages ? (
                  <div className="generated-images-interface">
                    <div className="generated-images-header">
                      <h3>Generated Virtual Try-On Images</h3>
                      <button
                        className="close-btn"
                        onClick={() => setShowGeneratedImages(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="generated-images-gallery">
                      {generatedImagesLoading ? (
                        <div className="loading-container">
                          <div className="loading-spinner"></div>
                          <p>Loading generated images...</p>
                        </div>
                      ) : generatedImages.length > 0 ? (
                        <div className="images-grid">
                          {generatedImages.map((image, index) => (
                            <div key={image.id || index} className="generated-image-item">
                              <img
                                src={`data:image/jpeg;base64,${image.image_base64}`}
                                alt={`Generated try-on ${index + 1}`}
                                style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
                              />
                              <div className="image-info">
                                <small>{new Date(image.created_at).toLocaleDateString()}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-images">
                          <p>No generated images yet. Try the virtual try-on feature!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : isCurrentMediaVideo() ? (
                  <video
                    src={getCurrentMediaUrl()}
                    controls
                    autoPlay
                    muted
                    loop
                    className={isZoomed ? 'zoomed' : ''}
                    onClick={() => setIsZoomed(!isZoomed)}
                    style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={isCurrentMediaGenerated() ? `data:image/jpeg;base64,${getCurrentMediaUrl()}` : (getCurrentMediaUrl() || '/placeholder.png')}
                    alt={product.name}
                    className={isZoomed ? 'zoomed' : ''}
                    onClick={() => setIsZoomed(!isZoomed)}
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                )}
                {!showVirtualTryOn && !showGeneratedImages && (
                  <>
                    <button
                      className="wishlist-btn"
                      onClick={handleWishlist}
                    >
                      {isWishlisted ? '❤️' : '♡'}
                    </button>
                    {product.sale_price && (
                      <span className="sale-badge">SALE</span>
                    )}
                  </>
                )}
              </div>
              <div className="image-thumbnails">
                {/* Product images and videos thumbnails */}
                {(product.images || []).concat(product.videos || []).map((media, index) => {
                  const imagesLen = product.images?.length || 0;
                  const isVideo = index >= imagesLen;
                  return (
                    <div
                      key={`product-${index}`}
                      className={`thumbnail ${currentMedia === index ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentMedia(index);
                        setShowVirtualTryOn(false);
                        setShowGeneratedImages(false);
                      }}
                    >
                      {isVideo ? (
                        <video
                          src={media}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          muted
                        />
                      ) : (
                        <img
                          src={media}
                          alt={`${product.name} view ${index + 1}`}
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                      )}
                    </div>
                  );
                })}
                {/* Virtual Try On button */}
                <div
                  className={`thumbnail virtual-try-on ${showVirtualTryOn ? 'active' : ''}`}
                  onClick={() => setShowVirtualTryOn(true)}
                >
                  <div className="virtual-try-on-icon">👕</div>
                  <span>Virtual Try On</span>
                </div>
                {/* Generated images thumbnails */}
                {generatedImages.map((genImg, index) => {
                  const imagesLen = product.images?.length || 0;
                  const videosLen = product.videos?.length || 0;
                  const mediaIndex = imagesLen + videosLen + index;
                  return (
                    <div
                      key={`generated-${genImg.id || index}`}
                      className={`thumbnail ${currentMedia === mediaIndex ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentMedia(mediaIndex);
                        setShowVirtualTryOn(false);
                        setShowGeneratedImages(false);
                      }}
                    >
                      <img
                        src={`data:image/jpeg;base64,${genImg.image_base64}`}
                        alt={`Generated try-on ${index + 1}`}
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="brand-header">
                <h1>InfiniteWaveX</h1>
                <p className="slogan">Designing Tomorrow, Today</p>
              </div>

              <h2>{product.name}</h2>

              <div className="price-section">
                {product.sale_price ? (
                  <>
                    <span className="current-price">${product.sale_price.toFixed(2)}</span>
                    <span className="original-price">${product.price.toFixed(2)}</span>
                    <span className="discount">({Math.round((1 - product.sale_price / product.price) * 100)}% OFF)</span>
                  </>
                ) : (
                  <span className="current-price">${product.price ? product.price.toFixed(2) : 'N/A'}</span>
                )}
              </div>

              <div className="rating-section">
                <div className="stars">
                  {renderStars(product.rating || 0)}
                  <span>({product.review_count || 0})</span>
                </div>
                <span className="sku">SKU: {product.sku || 'N/A'}</span>
              </div>

              {product.colors && product.colors.length > 0 && (
                <div className="color-section">
                  <h3>Color: {selectedColor}</h3>
                  <div className="color-options">
                    {product.colors.map((color, index) => (
                      <div
                        key={color || index}
                        className={`color-option ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                      >
                        <div
                          className="color-swatch"
                          style={{ backgroundColor: color.toLowerCase() }}
                        ></div>
                        <span>{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="size-section">
                  <div className="size-header">
                    <h3>Size: {selectedSize}</h3>
                    <button
                      className="size-guide-btn"
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                    >
                      Size Guide
                    </button>
                  </div>

                  <div className="size-options">
                    {product.sizes.map((size, index) => (
                      <button
                        key={size || index}
                        className={`size-option ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {showSizeGuide && (
                  <motion.div
                    className="size-guide"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h4>Size Guide (inches)</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Size</th>
                          {sizeGuide.measurements.map(m => (
                            <th key={m}>{m}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(sizeGuide.sizes).map(([size, measurements]) => (
                          <tr key={size}>
                            <td>{size}</td>
                            {measurements.map((m, i) => (
                              <td key={i}>{m}"</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="quantity-section">
                <h3>Quantity</h3>
                <div className="quantity-selector">
                  <button onClick={decrementQuantity}>-</button>
                  <span>{quantity}</span>
                  <button onClick={incrementQuantity}>+</button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className={isInCart ? "go-to-cart-btn" : "add-to-cart-btn"}
                  onClick={isInCart ? handleGoToCart : handleAddToCart}
                  disabled={!product.inventory_quantity || product.inventory_quantity <= 0}
                >
                  {product.inventory_quantity && product.inventory_quantity > 0
                    ? (isInCart ? 'Go to Bag' : 'Add to Bag')
                    : 'Out of Stock'
                  }
                </button>
                <button className="buy-now-btn">
                  Buy Now
                </button>
              </div>

              <div className="delivery-info">
                <p>🚚 Free delivery on orders over $100</p>
                <p>📦 Free returns within 30 days</p>
              </div>

              <div className="share-section">
                <button 
                  className="share-btn"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  Share
                </button>
                
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div 
                      className="share-menu"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      {shareOptions.map(option => (
                        <button key={option.name} className="share-option">
                          <span className="share-icon">{option.icon}</span>
                          {option.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="product-tabs">
            <div className="tab-headers">
              <button 
                className={activeTab === 'description' ? 'active' : ''}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={activeTab === 'details' ? 'active' : ''}
                onClick={() => setActiveTab('details')}
              >
                Details & Care
              </button>
              <button 
                className={activeTab === 'reviews' ? 'active' : ''}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({product.review_count || 0})
              </button>
              <button 
                className={activeTab === 'shipping' ? 'active' : ''}
                onClick={() => setActiveTab('shipping')}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-pane">
                  <h3>Product Description</h3>
                  <p>{product.description}</p>
                  
                  {product.features && product.features.length > 0 && (
                    <div className="features-list">
                      <h4>Features</h4>
                      <ul>
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="tab-pane">
                  <h3>Details & Care</h3>
                  <p>{product.details}</p>
                  
                  {product.materials && product.materials.length > 0 && (
                    <div className="materials-list">
                      <h4>Materials</h4>
                      <ul>
                        {product.materials.map((material, index) => (
                          <li key={index}>
                            {material.name}: {material.percentage}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="care-instructions">
                    <h4>Care Instructions</h4>
                    <ul>
                      <li>Dry clean only</li>
                      <li>Do not bleach</li>
                      <li>Iron on low heat</li>
                      <li>Line dry only</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="tab-pane">
                  <h3>Customer Reviews</h3>
                  
                  <div className="review-summary">
                    <div className="average-rating">
                      <span className="rating-number">{product.rating || 0}</span>
                      <div className="stars">{renderStars(product.rating || 0)}</div>
                      <span>{product.review_count || 0} reviews</span>
                    </div>
                    
                    <div className="rating-bars">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="rating-bar">
                          <span>{rating} ★</span>
                          <div className="bar">
                            <div 
                              className="fill" 
                              style={{ width: `${(rating / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span>{Math.round((rating / 5) * (product.review_count || 0))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="reviews-list">
                    {reviews.map(review => (
                      <div key={review.id} className="review">
                        <div className="review-header">
                          <div className="user-info">
                            <img src={review.avatar} alt={review.user} />
                            <div>
                              <h4>{review.user}</h4>
                              <div className="stars">{renderStars(review.rating)}</div>
                            </div>
                          </div>
                          <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button className="load-more-reviews">
                    Load More Reviews
                  </button>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="tab-pane">
                  <h3>Shipping & Returns</h3>
                  
                  <div className="shipping-info">
                    <h4>Shipping Options</h4>
                    <div className="shipping-options">
                      <div className="shipping-option">
                        <h5>Standard Shipping</h5>
                        <p>$4.99 - 3-5 business days</p>
                      </div>
                      <div className="shipping-option">
                        <h5>Express Shipping</h5>
                        <p>$9.99 - 1-2 business days</p>
                      </div>
                      <div className="shipping-option">
                        <h5>Free Shipping</h5>
                        <p>Free on orders over $100 - 5-7 business days</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="returns-info">
                    <h4>Returns Policy</h4>
                    <p>We offer free returns within 30 days of delivery. Items must be unworn with original tags attached and in original packaging.</p>
                    
                    <h5>How to Return:</h5>
                    <ol>
                      <li>Initiate a return through your account page</li>
                      <li>Print the prepaid shipping label</li>
                      <li>Package your return securely</li>
                      <li>Drop off at any shipping carrier location</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <div className="related-products">
            <h2>You Might Also Like</h2>
            <div className="products-grid">
              {relatedProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    <button className="quick-view">Quick View</button>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Story */}
          <div className="brand-story">
            <h2>InfiniteWaveX</h2>
            <h3>Shaping Dreams with Timeless Waves</h3>
            <p>
              At IWX, we believe in the power of design to transform not just spaces and products, 
              but lives. Our mission is to create pieces that stand the test of time, blending 
              innovative design with timeless elegance. Each creation tells a story of craftsmanship, 
              passion, and vision for a better tomorrow.
            </p>
            <div className="brand-stats">
              <div className="stat">
                <h4>15+</h4>
                <p>Years of Excellence</p>
              </div>
              <div className="stat">
                <h4>500+</h4>
                <p>Design Collections</p>
              </div>
              <div className="stat">
                <h4>2M+</h4>
                <p>Satisfied Clients</p>
              </div>
            </div>
          </div>

          {/* Sustainability */}
          <div className="sustainability">
            <h2>Our Commitment to Sustainability</h2>
            <div className="sustainability-grid">
              <div className="sustainability-item">
                <div className="icon">🌱</div>
                <h3>Eco-Friendly Materials</h3>
                <p>We use sustainable and recycled materials in our products whenever possible.</p>
              </div>
              <div className="sustainability-item">
                <div className="icon">♻️</div>
                <h3>Recycling Program</h3>
                <p>Return your old IWX products for recycling and get 15% off your next purchase.</p>
              </div>
              <div className="sustainability-item">
                <div className="icon">🌍</div>
                <h3>Carbon Neutral Shipping</h3>
                <p>All our shipments are carbon neutral through our partnership with environmental organizations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;