import React from 'react';
import './Icon.css';

const Icon = ({ name, size = 'medium', className = '', ...props }) => {
  return (
    <span
      className={`icon icon-${name} ${size} ${className}`}
      {...props}
    >
      {getIconSymbol(name)}
    </span>
  );
};

const getIconSymbol = (name) => {
  const icons = {
    heart: '♥',
    star: '★',
    cart: '🛒',
    user: '👤',
    search: '🔍',
    menu: '☰',
    close: '✕',
    arrowLeft: '‹',
    arrowRight: '›',
    check: '✓',
    plus: '+',
    minus: '-',
    share: '📤',
    wishlist: '♡',
    wishlistFilled: '❤️',
    loading: '⟳',
    error: '⚠',
    success: '✓',
    info: 'ℹ',
    filter: '⚙',
    sort: '⇅',
    grid: '⊞',
    list: '☰',
    zoom: '🔍',
    play: '▶',
    pause: '⏸',
    volume: '🔊',
    mute: '🔇'
  };

  return icons[name] || '?';
};

export default Icon;
