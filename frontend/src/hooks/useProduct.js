import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../api/productAPI';

export const useProduct = (id) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          navigate('/error/404');
          return;
        }
        setProduct(productData);
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/error/404');
          return;
        }
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  return { product, loading, error };
};
