import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import './ModelViewer.css';

const ModelViewer = () => {
  const [currentModel, setCurrentModel] = useState('male');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('virtual-try-on');
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const fileInputRef = useRef(null);

  // Sample outfit data
  const outfits = [
    {
      id: 1,
      name: 'Premium Leather Jacket',
      category: 'Outerwear',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      colors: ['Black', 'Brown', 'Navy'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      id: 2,
      name: 'Designer Silk Dress',
      category: 'Dresses',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      colors: ['Navy', 'Red', 'Beige'],
      sizes: ['XS', 'S', 'M', 'L']
    },
    {
      id: 3,
      name: 'Casual Sneakers',
      category: 'Footwear',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
      colors: ['White', 'Black', 'Gray'],
      sizes: ['US 6', 'US 7', 'US 8', 'US 9', 'US 10']
    },
    {
      id: 4,
      name: 'Cashmere Sweater',
      category: 'Knitwear',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
      colors: ['Cream', 'Gray', 'Navy'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    }
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          setUploadedImage(e.target.result);
          setCurrentModel('sample');
          setIsLoading(false);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload({ target: { files: [file] } });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setCurrentModel('male');
    setSelectedOutfit(null);
  };

  const tryOutfit = (outfit) => {
    setSelectedOutfit(outfit);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

const renderModel = () => {
  if (uploadedImage) {
    return (
      <div className="model-placeholder">
        <div className="model-image-container">
          <img src={uploadedImage} alt="Your uploaded photo" className="uploaded-model-image" />
          {selectedOutfit && (
            <div className="outfit-overlay">
              <img src={selectedOutfit.image} alt={selectedOutfit.name} className="outfit-preview" />
            </div>
          )}
        </div>
        <p className="model-placeholder-text">Virtual Try-On Preview</p>
      </div>
    );
  }

  return (
    <div className="model-placeholder">
      <model-viewer
        src={`/models/${currentModel}.glb`}
        alt={`${currentModel} model`}
        camera-controls
        auto-rotate
        ar
        style={{ width: '100%', height: '400px' }}
      >
      </model-viewer>
      <p className="model-placeholder-text">
        {currentModel === 'male' ? 'Male Model' : 'Female Model'}
      </p>
      {selectedOutfit && (
        <div className="outfit-preview-static">
          <img src={selectedOutfit.image} alt={selectedOutfit.name} />
          <p>{selectedOutfit.name}</p>
        </div>
      )}
    </div>
  );
};


  return (
    <div className="model-viewer-page">
      <Navbar />

      {/* Header Section */}
      <section className="model-viewer-header">
        <div className="container">
          <motion.div
            className="header-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1>Virtual Try-On Experience</h1>
            <p className="slogan">Designing Tomorrow, Today</p>
            <p className="tagline">Shaping Dreams with Timeless Waves</p>
            <p className="description">
              Experience fashion like never before with IWX's cutting-edge virtual try-on technology.
              See how our premium collections look on you before making a purchase.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            className="notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <p>{selectedOutfit ? 'Outfit applied to model!' : 'Photo uploaded successfully!'}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="model-viewer-container">
        <div className="container">
          <div className="model-viewer-content">
            {/* Controls Panel */}
            <div className="controls-panel">
              <div className="panel-header">
                <h2>Fashion Model Viewer</h2>
                <p>Rotate with mouse • Zoom with scroll</p>
              </div>
              
              {/* Model Selector */}
              <div className="model-selector">
                <h3>Select Model</h3>
                <div className="button-group">
                  <button 
                    className={`model-btn ${currentModel === 'male' && !uploadedImage ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentModel('male');
                      setUploadedImage(null);
                      setSelectedOutfit(null);
                    }}
                  >
                    <span className="model-icon">👨</span>
                    <span>Male Model</span>
                  </button>
                  <button 
                    className={`model-btn ${currentModel === 'female' && !uploadedImage ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentModel('female');
                      setUploadedImage(null);
                      setSelectedOutfit(null);
                    }}
                  >
                    <span className="model-icon">👩</span>
                    <span>Female Model</span>
                  </button>
                </div>
              </div>
              
              {/* Upload Section */}
              <div className="upload-section">
                <h3>Try Your Style</h3>
                <div 
                  className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploadedImage ? 'has-image' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  
                  {isLoading ? (
                    <div className="upload-loading">
                      <div className="loading-spinner"></div>
                      <p>Processing your image...</p>
                    </div>
                  ) : !uploadedImage ? (
                    <>
                      <div className="upload-icon">📷</div>
                      <p>Drag & drop your photo here</p>
                      <span>or click to browse</span>
                      <p className="upload-note">JPEG, PNG up to 10MB</p>
                    </>
                  ) : (
                    <div className="upload-preview">
                      <img src={uploadedImage} alt="Uploaded preview" />
                      <button className="clear-btn" onClick={(e) => { e.stopPropagation(); clearUpload(); }}>
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                {uploadedImage && (
                  <div className="upload-actions">
                    <button className="try-outfit-btn">
                      👗 Try Virtual Outfit
                    </button>
                    <button className="retake-btn" onClick={clearUpload}>
                      ↻ Retake Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Outfit Selection */}
              {uploadedImage && (
                <div className="outfit-selection">
                  <h3>Select Outfit</h3>
                  <div className="outfit-grid">
                    {outfits.map(outfit => (
                      <div 
                        key={outfit.id} 
                        className={`outfit-card ${selectedOutfit?.id === outfit.id ? 'selected' : ''}`}
                        onClick={() => tryOutfit(outfit)}
                      >
                        <div className="outfit-image">
                          <img src={outfit.image} alt={outfit.name} />
                          {selectedOutfit?.id === outfit.id && (
                            <div className="selected-badge">✓</div>
                          )}
                        </div>
                        <div className="outfit-info">
                          <h4>{outfit.name}</h4>
                          <p className="outfit-category">{outfit.category}</p>
                          <p className="outfit-price">${outfit.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Model Display */}
            <div className="canvas-container">
              <div className="model-display">
                {renderModel()}
              </div>
         
              
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Use Our Virtual Try-On?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👔</div>
              <h3>Perfect Fit</h3>
              <p>See exactly how clothes will fit your body type before purchasing.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💸</div>
              <h3>Save Money</h3>
              <p>Reduce returns by ensuring you love how items look on you.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Save Time</h3>
              <p>Try multiple outfits in minutes without changing clothes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Sustainable</h3>
              <p>Reduce fashion waste by making confident purchases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Your Photo</h3>
              <p>Take a clear photo of yourself or use an existing one.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Select Outfits</h3>
              <p>Browse our collection and choose items to try on virtually.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>See Yourself</h3>
              <p>View how the outfits look on your body from all angles.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Shop Confidently</h3>
              <p>Add your favorites to cart knowing they'll look great.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2>What Our Customers Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The virtual try-on feature saved me so much time! I could see exactly how the dress would fit before buying."</p>
              </div>
              <div className="testimonial-author">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" alt="Sarah Johnson" />
                <div>
                  <h4>Sarah Johnson</h4>
                  <p>Fashion Blogger</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"IWX's technology is amazing! I've reduced my returns by 80% since using the virtual fitting room."</p>
              </div>
              <div className="testimonial-author">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" alt="Michael Chen" />
                <div>
                  <h4>Michael Chen</h4>
                  <p>Regular Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How accurate is the virtual try-on?</h3>
              <p>Our technology uses advanced algorithms to provide a highly accurate representation of how clothes will fit your body type. For best results, use a well-lit photo taken against a plain background.</p>
            </div>
            <div className="faq-item">
              <h3>Is my photo data secure?</h3>
              <p>Yes, we take privacy seriously. Your photos are processed securely and are not stored on our servers after your session ends.</p>
            </div>
            <div className="faq-item">
              <h3>Can I try on multiple items at once?</h3>
              <p>Currently, you can try on one item at a time to ensure the best visualization experience.</p>
            </div>
            <div className="faq-item">
              <h3>What if the fit isn't right?</h3>
              <p>We offer free returns within 30 days if the item doesn't fit as expected, even after using our virtual try-on.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Revolutionize Your Shopping Experience?</h2>
            <p>Join thousands of satisfied customers who shop smarter with IWX's virtual try-on technology.</p>
            <div className="cta-buttons">
              <button className="cta-button primary" onClick={handleUploadClick}>
                Try It Now
              </button>
              <button className="cta-button secondary">
                Browse Collection
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ModelViewer;
