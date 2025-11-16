// Cart.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import AlertBox from '../components/AlertBox';
import websocketService from '../services/websocket';
import {
  fetchCart,
  updateCartItemQuantity,
  removeItemFromCart,
  updateCartFromWS,
  setWSConnected,
  addItemToCart
} from '../redux/slices/cartSlice';
import './Cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: cartItems,
    subtotal,
    tax_amount,
    shipping_cost,
    total_amount,
    itemCount,
    loading,
    error,
    wsConnected
  } = useSelector(state => state.cart);

  const { user } = useSelector(state => state.auth);

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [giftWrap, setGiftWrap] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Fetch cart data on component mount
    if (user) {
      dispatch(fetchCart());
    }

    // Simulate loading suggested items
    const loadSuggestedItems = () => {
      const items = [
        {
          id: 101,
          name: 'Classic White Shirt',
          price: 39.99,
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
          rating: 4.8
        },
        {
          id: 102,
          name: 'Cashmere Scarf',
          price: 69.99,
          image: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
          rating: 4.9
        },
        {
          id: 103,
          name: 'Minimalist Watch',
          price: 129.99,
          image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=930&q=80',
          rating: 4.7
        },
        {
          id: 104,
          name: 'Leather Belt',
          price: 45.99,
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80',
          rating: 4.5
        }
      ];
      setSuggestedItems(items);
    };

    loadSuggestedItems();
  }, [dispatch, user]);

  // WebSocket connection for real-time cart updates
  useEffect(() => {
    if (user && user.id) {
      const handleWSMessage = (data) => {
        if (data.type === 'CART_UPDATED') {
          dispatch(updateCartFromWS(data.data));
        }
      };

      const handleWSError = (error) => {
        console.error('Cart WebSocket error:', error);
        dispatch(setWSConnected(false));
      };

      const handleWSClose = () => {
        dispatch(setWSConnected(false));
      };

      const ws = websocketService.connect(`cart/${user.id}`, handleWSMessage, handleWSError, handleWSClose);
      if (ws) {
        dispatch(setWSConnected(true));
      }

      return () => {
        websocketService.disconnect(`cart/${user.id}`);
      };
    }
  }, [dispatch, user]);

  const updateQuantity = async (productId, newQuantity, size = null, color = null) => {
    if (newQuantity < 1) return;

    try {
      await dispatch(updateCartItemQuantity({
        productId,
        quantity: newQuantity,
        size,
        color
      })).unwrap();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error || 'Failed to update quantity'
      });
    }
  };

  const removeItem = async (productId, size = null, color = null) => {
    try {
      await dispatch(removeItemFromCart({
        productId,
        size,
        color
      })).unwrap();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error || 'Failed to remove item'
      });
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'IWX20') {
      setPromoApplied(true);
      setAlert({
        type: 'success',
        message: 'Promo code applied successfully! 20% discount added.'
      });
    } else {
      setAlert({
        type: 'error',
        message: 'Invalid promo code. Try IWX20 for 20% off.'
      });
    }
  };

  // Use values from Redux store, but keep promo logic for UI compatibility
  const discount = promoApplied ? subtotal * 0.2 : 0;
  const giftWrapFee = giftWrap ? 4.99 : 0;
  const adjustedSubtotal = subtotal - discount;
  const adjustedTotal = adjustedSubtotal + tax_amount + shipping_cost + giftWrapFee;

  const checkout = () => {
    navigate('/checkout');
  };

  const addSuggestedItem = async (item) => {
    try {
      await dispatch(addItemToCart({
        productId: item.id,
        quantity: 1,
        size: 'M',
        color: 'Black'
      })).unwrap();
      setAlert({
        type: 'success',
        message: 'Item added to cart successfully!'
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: error || 'Failed to add item to cart'
      });
    }
  };

  return (
    <div className="cart-page">
      <Navbar />
      {alert && (
        <AlertBox
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <header className="cart-header">
        <div className="container">
          <h1>SHOPPING BAG</h1>
          <p className="items-count">{itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}</p>
        </div>
      </header>

      <div className="cart-container">
        <div className="container">
          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items-section">
              <div className="section-header">
                <h2>Your Items</h2>
                <button className="continue-shopping" onClick={() => navigate('/productList')}>Continue Shopping</button>
              </div>

              {itemCount === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Your bag is empty</h3>
                  <p>Start shopping to add items to your bag</p>
                  <button className="start-shopping-btn" onClick={() => navigate('/productList')}>Start Shopping</button>
                </div>
              ) : (
                <div className="cart-items">
                  {cartItems.map(item => (
                    <div key={`${item.product_id}-${item.size}-${item.color}`} className="cart-item">
                      <div className="item-image">
                        <img src={item.product?.images?.[0] || item.image} alt={item.product?.name || item.name} />
                        {item.product && item.product.inventory_quantity < item.quantity && (
                          <span className="out-of-stock-badge">Out of Stock</span>
                        )}
                      </div>

                      <div className="item-details">
                        <h3 className="item-name">{item.product?.name || item.name}</h3>
                        <p className="item-color">Color: {item.color}</p>
                        <p className="item-size">Size: {item.size}</p>

                        <div className="item-price">
                          {item.product?.sale_price && (
                            <span className="original-price">${item.product.price.toFixed(2)}</span>
                          )}
                          <span className="current-price">${item.price.toFixed(2)}</span>
                        </div>

                        <p className="delivery-date">Estimated delivery: 3-5 business days</p>

                        {item.product && item.product.inventory_quantity < item.quantity && (
                          <p className="stock-notification">We'll notify you when this item is back in stock</p>
                        )}
                      </div>

                      <div className="item-controls">
                        <div className="quantity-selector">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.size, item.color)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.size, item.color)}>+</button>
                        </div>

                        <button className="remove-item" onClick={() => removeItem(item.product_id, item.size, item.color)}>
                          Remove
                        </button>

                        <button className="save-later">
                          Save for later
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-card">
                <h2>Order Summary</h2>
                
                <div className="summary-row">
                   <span>Subtotal</span>
                   <span>${subtotal.toFixed(2)}</span>
                 </div>

                 {promoApplied && (
                   <div className="summary-row discount">
                     <span>Discount (20%)</span>
                     <span>-${discount.toFixed(2)}</span>
                   </div>
                 )}

                 <div className="summary-row">
                   <span>Shipping</span>
                   <span>{shipping_cost === 0 ? 'FREE' : `$${shipping_cost.toFixed(2)}`}</span>
                 </div>

                 <div className="summary-row">
                   <span>
                     Gift Wrap
                     <label className="gift-wrap-toggle">
                       <input
                         type="checkbox"
                         checked={giftWrap}
                         onChange={() => setGiftWrap(!giftWrap)}
                       />
                       <span className="slider"></span>
                     </label>
                   </span>
                   <span>{giftWrap ? '$4.99' : 'Add'}</span>
                 </div>

                 <div className="summary-row">
                   <span>Tax</span>
                   <span>${tax_amount.toFixed(2)}</span>
                 </div>

                 <div className="summary-row total">
                   <span>Total</span>
                   <span>${(promoApplied ? adjustedTotal : total_amount + (giftWrap ? 4.99 : 0)).toFixed(2)}</span>
                 </div>
                
                <div className="promo-section">
                  {!promoApplied ? (
                    <div className="promo-input">
                      {showPromoInput ? (
                        <div className="promo-input-open">
                          <input
                            type="text"
                            placeholder="Enter promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                          />
                          <button onClick={applyPromoCode}>Apply</button>
                          <button className="cancel-promo" onClick={() => setShowPromoInput(false)}>×</button>
                        </div>
                      ) : (
                        <button 
                          className="add-promo-btn"
                          onClick={() => setShowPromoInput(true)}
                        >
                          + Add promo code
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="promo-applied">
                      <span>Promo code IWX20 applied</span>
                      <button onClick={() => {
                        setPromoApplied(false);
                        setPromoCode('');
                      }}>Remove</button>
                    </div>
                  )}
                </div>
                
                <button
                   className="checkout-btn"
                   onClick={checkout}
                   disabled={itemCount === 0}
                 >
                   Proceed to Checkout
                 </button>
                
                <div className="security-notice">
                  <span>🔒</span>
                  <p>Your payment information is secure and encrypted</p>
                </div>
                
                <div className="payment-methods">
                  <p>We accept:</p>
                  <div className="payment-icons">
                    <span>Visa</span>
                    <span>Mastercard</span>
                    <span>Amex</span>
                    <span>PayPal</span>
                    <span>Apple Pay</span>
                  </div>
                </div>
              </div>
              
              <div className="shipping-info">
                <h3>Free Shipping on Orders Over $100</h3>
                <p>Add ${(100 - subtotal).toFixed(2)} more to qualify for free shipping</p>
                <div className="shipping-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="return-policy">
                <h3>Easy Returns</h3>
                <p>Free 30-day returns. No questions asked.</p>
              </div>
            </div>
          </div>
          
          {/* Recently Viewed */}
          {itemCount > 0 && (
            <div className="recently-viewed-section">
              <h2>Recently Viewed</h2>
              <div className="viewed-items">
                {suggestedItems.slice(0, 4).map(item => (
                  <div key={item.id} className="viewed-item">
                    <img src={item.image} alt={item.name} />
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                    <button onClick={() => addSuggestedItem(item)}>Add to Bag</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* You Might Also Like */}
          <div className="suggested-items-section">
            <h2>Complete Your Look</h2>
            <p className="section-subtitle">Items that pair well with your selection</p>
            
            <div className="suggested-items">
              {suggestedItems.map(item => (
                <motion.div 
                  key={item.id} 
                  className="suggested-item"
                  whileHover={{ y: -5 }}
                >
                  <div className="suggested-item-image">
                    <img src={item.image} alt={item.name} />
                    <button 
                      className="quick-add-btn"
                      onClick={() => addSuggestedItem(item)}
                    >
                      + Quick Add
                    </button>
                  </div>
                  <div className="suggested-item-info">
                    <h3>{item.name}</h3>
                    <div className="item-rating">
                      <div className="stars">
                        {'★'.repeat(Math.floor(item.rating))}
                        {'☆'.repeat(5 - Math.floor(item.rating))}
                      </div>
                      <span>{item.rating}</span>
                    </div>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Sustainability Notice */}
          <div className="sustainability-section">
            <div className="sustainability-content">
              <h2>Sustainable Shopping</h2>
              <p>At IWX, we're committed to reducing our environmental impact. For every order, we donate 1% to environmental causes and use 100% recycled packaging.</p>
              <div className="sustainability-features">
                <div className="feature">
                  <span>🌱</span>
                  <h4>Carbon Neutral Shipping</h4>
                  <p>All shipments are carbon offset</p>
                </div>
                <div className="feature">
                  <span>♻️</span>
                  <h4>Recycled Packaging</h4>
                  <p>100% recycled and recyclable materials</p>
                </div>
                <div className="feature">
                  <span>💧</span>
                  <h4>Water Conservation</h4>
                  <p>Using processes that save water</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-items">
              <div className="faq-item">
                <h4>What is your return policy?</h4>
                <p>We offer free returns within 30 days of purchase. Items must be unworn with original tags attached.</p>
              </div>
              <div className="faq-item">
                <h4>How long does shipping take?</h4>
                <p>Standard shipping takes 3-5 business days. Express shipping is available for an additional fee.</p>
              </div>
              <div className="faq-item">
                <h4>Do you ship internationally?</h4>
                <p>Yes, we ship to over 50 countries worldwide. International shipping rates apply.</p>
              </div>
              <div className="faq-item">
                <h4>How can I track my order?</h4>
                <p>Once your order ships, you'll receive a tracking number via email to monitor your delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;