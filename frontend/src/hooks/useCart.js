import { useState, useEffect } from 'react';
import { cartAPI } from '../api/cartAPI';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await cartAPI.getCart();
      setCartItems(cartData.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1, size = null, color = null) => {
    try {
      setLoading(true);
      setError(null);
      await cartAPI.addToCart(productId, quantity, size, color);
      await fetchCart(); // Refresh cart after adding
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    // Implement remove from cart API call when available
    console.log('Remove from cart:', itemId);
  };

  const updateQuantity = async (itemId, quantity) => {
    // Implement update quantity API call when available
    console.log('Update quantity:', itemId, quantity);
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    fetchCart,
    getTotal,
    getItemCount
  };
};
