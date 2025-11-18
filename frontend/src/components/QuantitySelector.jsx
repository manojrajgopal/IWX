import React from 'react';
import './QuantitySelector.css';

const QuantitySelector = ({ quantity, onIncrement, onDecrement, min = 1, max = 99 }) => {
  return (
    <div className="quantity-selector">
      <button
        onClick={onDecrement}
        disabled={quantity <= min}
        className="quantity-btn"
      >
        -
      </button>
      <span className="quantity-value">{quantity}</span>
      <button
        onClick={onIncrement}
        disabled={quantity >= max}
        className="quantity-btn"
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
