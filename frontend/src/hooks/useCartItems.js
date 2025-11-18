import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { cartAPI } from '../../api/cartAPI';

export const useCartItems = (productId, size, color) => {
  const { user } = useSelector(state => state.auth);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkCartStatus = async () => {
      if (user && productId) {
        try {
          const cartResponse = await cartAPI.getCart();
          const itemInCart = cartResponse.items.some(item =>
            item.product_id === productId &&
            item.size === size &&
            item.color === color
          );
          setIsInCart(itemInCart);
        } catch (error) {
          console.error('Failed to check cart status:', error);
        }
      }
    };

    checkCartStatus();
  }, [user, productId, size, color]);

  const addToCart = async (quantity = 1) => {
    if (!user) return false;

    setLoading(true);
    try {
      await cartAPI.addToCart({
        product_id: productId,
        quantity,
        size,
        color
      });
      setIsInCart(true);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { isInCart, loading, addToCart };
};
