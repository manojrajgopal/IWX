import React from 'react';

const ProductMedia = ({ product, currentMedia, setCurrentMedia, isZoomed, setIsZoomed, showVirtualTryOn, showGeneratedImages, goToPrevMedia, goToNextMedia, handleWishlist, isWishlisted, productImages, generatedImages }) => {
  // Simplified version
  return (
    <div className="product-images">
      <div className="main-image">
        <img
          src={product?.images?.[currentMedia] || '/placeholder.png'}
          alt={product?.name}
          className={isZoomed ? 'zoomed' : ''}
          onClick={() => setIsZoomed(!isZoomed)}
        />
        {!showVirtualTryOn && !showGeneratedImages && (
          <>
            <button className="nav-btn prev-btn" onClick={goToPrevMedia}>‹</button>
            <button className="nav-btn next-btn" onClick={goToNextMedia}>›</button>
            <button className="wishlist-btn" onClick={handleWishlist}>
              {isWishlisted ? '❤️' : '♡'}
            </button>
          </>
        )}
      </div>
      <div className="image-thumbnails">
        {productImages?.map((image, index) => (
          <div
            key={index}
            className={`thumbnail ${currentMedia === index ? 'active' : ''}`}
            onClick={() => setCurrentMedia(index)}
          >
            <img src={image} alt={`View ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductMedia;
