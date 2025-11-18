import React from 'react';
import './Rating.css';

const Rating = ({ rating, maxRating = 5, size = 'medium', interactive = false, onRatingChange }) => {
  const renderStars = () => {
    return Array.from({ length: maxRating }, (_, i) => {
      const filled = i < Math.floor(rating);
      const partial = rating % 1 !== 0 && i === Math.floor(rating);

      return (
        <span
          key={i}
          className={`star ${filled ? 'filled' : ''} ${partial ? 'partial' : ''} ${size}`}
          onClick={interactive ? () => onRatingChange && onRatingChange(i + 1) : undefined}
          style={interactive ? { cursor: 'pointer' } : {}}
        >
          ★
        </span>
      );
    });
  };

  return (
    <div className="rating">
      {renderStars()}
      {rating && <span className="rating-value">({rating})</span>}
    </div>
  );
};

export default Rating;
