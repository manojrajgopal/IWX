import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { wishlistAPI } from '../../api/wishlistAPI';

export const useWishlist = (productId, size, color) => {
  const { user } = useSelector(state => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && productId) {
        try {
          const result = await wishlistAPI.checkInWishlist(productId, size, color);
          setIsWishlisted(result.in_wishlist);
        } catch (error) {
          console.error('Failed to check wishlist status:', error);
        }
      }
    };

    checkWishlistStatus();
  }, [user, productId, size, color]);

  const toggleWishlist = async () => {
    if (!user) return false;

    setLoading(true);
    try {
      if (isWishlisted) {
        const wishlist = await wishlistAPI.getWishlist();
        const item = wishlist.items.find(item =>
          item.product_id === productId &&
          item.size === size &&
          item.color === color
        );
        if (item) {
          await wishlistAPI.removeFromWishlist(item.id);
        }
      } else {
        await wishlistAPI.addToWishlist({
          product_id: productId,
          size,
          color,
          quantity: 1
        });
      }
      setIsWishlisted(!isWishlisted);
      return true;
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { isWishlisted, loading, toggleWishlist };
};
