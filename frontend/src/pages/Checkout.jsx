// Checkout.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import AddressForm from '../components/Profile/AddressForm';
import PaymentForm from '../components/Profile/PaymentForm';
import { addressAPI } from '../api/addressAPI';
import { paymentAPI } from '../api/paymentAPI';
import { orderAPI } from '../api/orderAPI';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, subtotal, tax_amount, shipping_cost, total_amount } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);

  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    saveInfo: false
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isGiftCardApplied, setIsGiftCardApplied] = useState(false);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('contact');
  const [orderData, setOrderData] = useState(null);

  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Payment management states
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // Friend ordering option
  const [isOrderingForFriend, setIsOrderingForFriend] = useState(false);
  const [friendDetails, setFriendDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  // Calculate order totals using Redux data
  const shippingCost = shippingMethod === 'express' ? 9.99 : (subtotal >= 100 ? 0 : 4.99);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFriendInputChange = (e) => {
    const { name, value } = e.target;
    setFriendDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setIsAddressFormOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      if (editingAddress) {
        await addressAPI.updateAddress(editingAddress.id, addressData);
      } else {
        await addressAPI.createAddress(addressData);
      }
      // Refresh addresses
      const response = await addressAPI.getAddresses();
      const updatedAddresses = response.addresses || [];
      setAddresses(updatedAddresses);
      // Set as selected if it's new or was default
      if (!editingAddress || addressData.is_default) {
        const newAddress = updatedAddresses.find(addr =>
          addr.name === addressData.name &&
          addr.first_name === addressData.first_name &&
          addr.last_name === addressData.last_name
        );
        if (newAddress) {
          setSelectedAddressId(newAddress.id);
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  };

  const handlePaymentSelect = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setPaymentMethod('creditCard'); // Set to credit card when selecting saved payment
    setShowPaymentOptions(false); // Hide payment options when selecting saved payment
  };

  const handleAddNewPayment = () => {
    setSelectedPaymentId(null); // Deselect any saved payment
    setShowPaymentOptions(true);
  };

  const handleSelectPaymentType = (paymentType) => {
    if (paymentType === 'creditCard') {
      setEditingPayment(null);
      setIsPaymentFormOpen(true);
    } else {
      setPaymentMethod(paymentType);
      setSelectedPaymentId(null); // Ensure no saved payment is selected
    }
    setShowPaymentOptions(false);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setIsPaymentFormOpen(true);
  };

  const handleSavePayment = async (paymentData) => {
    try {
      if (editingPayment) {
        await paymentAPI.updatePaymentMethod(editingPayment.id, paymentData);
      } else {
        await paymentAPI.createPaymentMethod(paymentData);
      }
      // Refresh payment methods
      const response = await paymentAPI.getPaymentMethods();
      const updatedPayments = response.payments || [];
      setPaymentMethods(updatedPayments);
      // Set as selected if it's new or was default
      if (!editingPayment || paymentData.is_default) {
        const newPayment = updatedPayments.find(payment =>
          payment.credit_card?.card_number === paymentData.credit_card?.card_number ||
          payment.credit_card?.last_four === paymentData.credit_card?.last_four
        );
        if (newPayment) {
          setSelectedPaymentId(newPayment.id);
        }
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  };

  // Redirect to cart if no items
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Fetch addresses and payments on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // Fetch addresses
        setLoadingAddresses(true);
        try {
          const addressResponse = await addressAPI.getAddresses();
          const userAddresses = addressResponse.addresses || [];
          setAddresses(userAddresses);
          // Set default address as selected if available
          const defaultAddress = userAddresses.find(addr => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
        } finally {
          setLoadingAddresses(false);
        }

        // Fetch payment methods
        setLoadingPayments(true);
        try {
          const paymentResponse = await paymentAPI.getPaymentMethods();
          const userPayments = paymentResponse.payments || [];
          setPaymentMethods(userPayments);
          // Set default payment as selected if available
          const defaultPayment = userPayments.find(payment => payment.is_default);
          if (defaultPayment) {
            setSelectedPaymentId(defaultPayment.id);
          }
        } catch (error) {
          console.error('Error fetching payment methods:', error);
        } finally {
          setLoadingPayments(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const applyGiftCard = () => {
    if (giftCardCode.trim() !== '') {
      setIsGiftCardApplied(true);
      // In a real app, you would validate the gift card code with your backend
    }
  };

  const applyPromoCode = () => {
    if (promoCode.trim() !== '') {
      setIsPromoApplied(true);
      // In a real app, you would validate the promo code with your backend
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get selected address details
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

      // Get selected payment details
      const selectedPayment = paymentMethods.find(payment => payment.id === selectedPaymentId);

      // Prepare order data
      const orderPayload = {
        user_id: user?.id,
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
          subtotal: item.quantity * item.price
        })),
        shipping_address: selectedAddress ? {
          first_name: selectedAddress.first_name,
          last_name: selectedAddress.last_name,
          address_line_1: selectedAddress.street_address,
          address_line_2: "",
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
          phone: selectedAddress.phone
        } : null,
        billing_address: selectedAddress ? {
          first_name: selectedAddress.first_name,
          last_name: selectedAddress.last_name,
          address_line_1: selectedAddress.street_address,
          address_line_2: "",
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
          phone: selectedAddress.phone
        } : null,
        payment_method: selectedPaymentId ? `payment_${selectedPaymentId}` : paymentMethod,
        shipping_method: shippingMethod
      };

      // Create order
      const createdOrder = await orderAPI.createOrder(orderPayload);
      setOrderData(createdOrder);
      setOrderComplete(true);

    } catch (error) {
      console.error('Error creating order:', error);
      // Handle error (could show error message)
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? '' : section);
  };

  if (orderComplete) {
    return (
      <div className="checkout-container">
        <div className="order-confirmation">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="confirmation-content"
          >
            <div className="confirmation-icon">✓</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase. Your order number is <strong>{orderData?.order_number || 'IWX-' + Math.floor(Math.random() * 10000)}</strong></p>
            <p>We've sent a confirmation email to {customerInfo.email}</p>
            
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Items:</span>
                  <span>${orderData?.subtotal?.toFixed(2) || subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>{orderData?.shipping_cost === 0 ? 'FREE' : `$${orderData?.shipping_cost?.toFixed(2) || shipping_cost.toFixed(2)}`}</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>${orderData?.tax_amount?.toFixed(2) || tax_amount.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${orderData?.total_amount?.toFixed(2) || total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="shipping-info">
              <h2>Shipping Information</h2>
              {orderData?.shipping_address ? (
                <>
                  <p>{orderData.shipping_address.first_name} {orderData.shipping_address.last_name}</p>
                  <p>{orderData.shipping_address.street_address}</p>
                  <p>{orderData.shipping_address.city}, {orderData.shipping_address.state} {orderData.shipping_address.postal_code}</p>
                  <p>{orderData.shipping_address.country}</p>
                  {orderData.shipping_address.phone && <p>📞 {orderData.shipping_address.phone}</p>}
                </>
              ) : (
                <>
                  <p>{customerInfo.firstName} {customerInfo.lastName}</p>
                  <p>{customerInfo.address}</p>
                  <p>{customerInfo.city}, {customerInfo.state} {customerInfo.zipCode}</p>
                  <p>{customerInfo.country}</p>
                </>
              )}
            </div>

            <div className="confirmation-actions">
              <button className="continue-shopping" onClick={() => navigate('/productList')}>Continue Shopping</button>
              <button className="track-order" onClick={() => navigate(`/orderTracking/${orderData.id}`)}>Track Your Order</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <Navbar />

      <div className="checkout-header">
        <h1>InfiniteWaveX</h1>
        <p className="slogan">Designing Tomorrow, Today</p>
        <p className="checkout-progress">Checkout</p>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          <div className="checkout-steps">
            <div className={`step ${activeAccordion === 'contact' ? 'active' : ''}`}>
              <div className="step-header" onClick={() => toggleAccordion('contact')}>
                <span className="step-number">1</span>
                <span className="step-title">Contact Information</span>
                <span className="step-toggle">{activeAccordion === 'contact' ? '−' : '+'}</span>
              </div>
              <AnimatePresence>
                {activeAccordion === 'contact' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="step-content"
                  >
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="emailUpdates"
                        name="emailUpdates"
                      />
                      <label htmlFor="emailUpdates">Email me with news and offers</label>
                    </div>
                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="orderingForFriend"
                        checked={isOrderingForFriend}
                        onChange={(e) => setIsOrderingForFriend(e.target.checked)}
                      />
                      <label htmlFor="orderingForFriend">I'm ordering for a friend - add their details so delivery boy can contact them</label>
                    </div>
                    {isOrderingForFriend && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="friend-details"
                      >
                        <h4>Friend's Details</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>First Name</label>
                            <input
                              type="text"
                              name="firstName"
                              value={friendDetails.firstName}
                              onChange={handleFriendInputChange}
                              placeholder="Friend's first name"
                            />
                          </div>
                          <div className="form-group">
                            <label>Last Name</label>
                            <input
                              type="text"
                              name="lastName"
                              value={friendDetails.lastName}
                              onChange={handleFriendInputChange}
                              placeholder="Friend's last name"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Phone Number</label>
                            <input
                              type="tel"
                              name="phone"
                              value={friendDetails.phone}
                              onChange={handleFriendInputChange}
                              placeholder="Friend's phone number"
                            />
                          </div>
                          <div className="form-group">
                            <label>Email Address</label>
                            <input
                              type="email"
                              name="email"
                              value={friendDetails.email}
                              onChange={handleFriendInputChange}
                              placeholder="Friend's email"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`step ${activeAccordion === 'shipping' ? 'active' : ''}`}>
              <div className="step-header" onClick={() => toggleAccordion('shipping')}>
                <span className="step-number">2</span>
                <span className="step-title">Shipping Address</span>
                <span className="step-toggle">{activeAccordion === 'shipping' ? '−' : '+'}</span>
              </div>
              <AnimatePresence>
                {activeAccordion === 'shipping' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="step-content"
                  >
                    {loadingAddresses ? (
                      <div className="loading-addresses">Loading addresses...</div>
                    ) : addresses.length > 0 ? (
                      <>
                        <div className="address-selection">
                          <h4>Select Delivery Address</h4>
                          <div className="addresses-grid">
                            {addresses.map(address => (
                              <div
                                key={address.id}
                                className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                                onClick={() => handleAddressSelect(address.id)}
                              >
                                <div className="address-radio">
                                  <input
                                    type="radio"
                                    name="selectedAddress"
                                    checked={selectedAddressId === address.id}
                                    onChange={() => handleAddressSelect(address.id)}
                                  />
                                </div>
                                <div className="address-header">
                                  <h3>{address.name}</h3>
                                  {address.is_default && <span className="default-badge">Default</span>}
                                </div>
                                <div className="address-details">
                                  <p>{address.first_name} {address.last_name}</p>
                                  <p>{address.street_address}</p>
                                  <p>{address.city}, {address.state} {address.postal_code}</p>
                                  <p>{address.country}</p>
                                  {address.phone && <p>📞 {address.phone}</p>}
                                </div>
                                <div className="address-actions">
                                  <button
                                    className="edit-address-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAddress(address);
                                    }}
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="add-address-section">
                          <button
                            type="button"
                            className="add-new-address-btn"
                            onClick={handleAddNewAddress}
                          >
                            + Add New Address
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="no-addresses">
                        <p>No saved addresses found.</p>
                        <button
                          type="button"
                          className="add-new-address-btn"
                          onClick={handleAddNewAddress}
                        >
                          + Add New Address
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`step ${activeAccordion === 'method' ? 'active' : ''}`}>
              <div className="step-header" onClick={() => toggleAccordion('method')}>
                <span className="step-number">3</span>
                <span className="step-title">Shipping Method</span>
                <span className="step-toggle">{activeAccordion === 'method' ? '−' : '+'}</span>
              </div>
              <AnimatePresence>
                {activeAccordion === 'method' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="step-content"
                  >
                    <div className="shipping-options">
                      <label className="shipping-option">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={shippingMethod === 'standard'}
                          onChange={(e) => setShippingMethod(e.target.value)}
                        />
                        <div className="option-content">
                          <span className="option-name">Standard Shipping</span>
                          <span className="option-details">3-5 business days</span>
                          <span className="option-price">$4.99</span>
                        </div>
                      </label>
                      <label className="shipping-option">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === 'express'}
                          onChange={(e) => setShippingMethod(e.target.value)}
                        />
                        <div className="option-content">
                          <span className="option-name">Express Shipping</span>
                          <span className="option-details">1-2 business days</span>
                          <span className="option-price">$9.99</span>
                        </div>
                      </label>
                      <label className="shipping-option free">
                        <input
                          type="radio"
                          name="shipping"
                          value="free"
                          checked={shippingMethod === 'free'}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          disabled={subtotal < 100}
                        />
                        <div className="option-content">
                          <span className="option-name">Free Shipping</span>
                          <span className="option-details">5-7 business days</span>
                          <span className="option-price">Free</span>
                          {subtotal < 100 && (
                            <span className="option-note">Add ${(100 - subtotal).toFixed(2)} more for free shipping</span>
                          )}
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`step ${activeAccordion === 'payment' ? 'active' : ''}`}>
              <div className="step-header" onClick={() => toggleAccordion('payment')}>
                <span className="step-number">4</span>
                <span className="step-title">Payment Method</span>
                <span className="step-toggle">{activeAccordion === 'payment' ? '−' : '+'}</span>
              </div>
              <AnimatePresence>
                {activeAccordion === 'payment' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="step-content"
                  >
                    {loadingPayments ? (
                      <div className="loading-payments">Loading payment methods...</div>
                    ) : paymentMethods.length > 0 ? (
                      <>
                        <div className="payment-selection">
                          <h4>Select Payment Method</h4>
                          <div className="payment-methods-list">
                            {paymentMethods.map(payment => (
                              <div
                                key={payment.id}
                                className={`payment-card ${selectedPaymentId === payment.id ? 'selected' : ''}`}
                                onClick={() => handlePaymentSelect(payment.id)}
                              >
                                <div className="payment-radio">
                                  <input
                                    type="radio"
                                    name="selectedPayment"
                                    checked={selectedPaymentId === payment.id}
                                    onChange={() => handlePaymentSelect(payment.id)}
                                  />
                                </div>
                                <div className="payment-header">
                                  <div className="payment-type">
                                    <div className="card-icon">💳</div>
                                    <div>
                                        <h3>{payment.display_name || `${payment.credit_card?.card_brand?.toUpperCase() || 'CARD'} **** **** **** ${payment.credit_card?.last_four || '****'}`}</h3>
                                        <p>{payment.credit_card?.cardholder_name || 'Card Holder'}</p>
                                        {payment.credit_card && (
                                          <p>Expires {payment.credit_card.expiry_month}/{payment.credit_card.expiry_year}</p>
                                        )}
                                      </div>
                                  </div>
                                  {payment.is_default && <span className="default-badge">Default</span>}
                                  <div className="payment-actions">
                                    <button
                                      className="edit-payment-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPayment(payment);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="add-payment-section">
                          {!showPaymentOptions ? (
                            <button
                              type="button"
                              className="add-new-payment-btn"
                              onClick={handleAddNewPayment}
                            >
                              + Add New Payment Method
                            </button>
                          ) : (
                            <div className="payment-type-selection">
                              <h4>Choose Payment Type</h4>
                              <div className="payment-type-buttons">
                                <button
                                  type="button"
                                  className="payment-type-btn"
                                  onClick={() => handleSelectPaymentType('creditCard')}
                                >
                                  💳 Credit/Debit Card
                                </button>
                                <button
                                  type="button"
                                  className="payment-type-btn"
                                  onClick={() => handleSelectPaymentType('paypal')}
                                >
                                  🅿️ PayPal
                                </button>
                                <button
                                  type="button"
                                  className="payment-type-btn"
                                  onClick={() => handleSelectPaymentType('applePay')}
                                >
                                  🍎 Apple Pay
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="no-payments">
                        <p>No saved payment methods found.</p>
                        <button
                          type="button"
                          className="add-new-payment-btn"
                          onClick={handleAddNewPayment}
                        >
                          + Add New Payment Method
                        </button>
                      </div>
                    )}


                    {paymentMethod === 'paypal' && !selectedPaymentId && (
                      <div className="paypal-info">
                        <p>You will be redirected to PayPal to complete your payment.</p>
                      </div>
                    )}

                    {paymentMethod === 'applePay' && !selectedPaymentId && (
                      <div className="apple-pay-info">
                        <p>Complete your purchase using Apple Pay for a faster checkout experience.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="order-notes">
            <h3>Order Notes</h3>
            <textarea placeholder="Add special instructions for your order..."></textarea>
          </div>

          <div className="gift-options">
            <h3>Gift Options</h3>
            <div className="gift-checkbox">
              <input type="checkbox" id="giftWrapping" />
              <label htmlFor="giftWrapping">Add gift wrapping - $5.99</label>
            </div>
            <div className="gift-message">
              <label>Gift Message (optional)</label>
              <textarea placeholder="Add a personal message..."></textarea>
            </div>
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="cart-items">
              {orderData?.items ? orderData.items.map(item => (
                <div key={`${item.product_id}-${item.size}-${item.color}`} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>{item.color} / {item.size}</p>
                    <div className="item-price">${item.price.toFixed(2)}</div>
                  </div>
                </div>
              )) : cartItems.map(item => (
                <div key={`${item.product_id}-${item.size}-${item.color}`} className="cart-item">
                  <div className="item-image">
                    <img src={item.product?.images?.[0] || item.image} alt={item.product?.name || item.name} />
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="item-details">
                    <h4>{item.product?.name || item.name}</h4>
                    <p>{item.color} / {item.size}</p>
                    <div className="item-price">${item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax_amount.toFixed(2)}</span>
              </div>
              
              <div className="promo-section">
                <div className="promo-input">
                  <input
                    type="text"
                    placeholder="Gift card or discount code"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    disabled={isGiftCardApplied}
                  />
                  <button 
                    onClick={applyGiftCard}
                    disabled={isGiftCardApplied || giftCardCode.trim() === ''}
                  >
                    {isGiftCardApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                
                <div className="promo-input">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={isPromoApplied}
                  />
                  <button 
                    onClick={applyPromoCode}
                    disabled={isPromoApplied || promoCode.trim() === ''}
                  >
                    {isPromoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span>${total_amount.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="place-order-btn"
              onClick={handleSubmitOrder}
              disabled={isLoading || cartItems.length === 0 || !selectedAddressId}
            >
              {isLoading ? 'Processing...' : `Place Order - $${total_amount.toFixed(2)}`}
            </button>

            <div className="security-notice">
              <p>🔒 Your payment information is secure and encrypted</p>
            </div>

            <div className="return-policy">
              <h3>Return Policy</h3>
              <p>Free returns within 30 days of delivery. Items must be unworn with original tags attached.</p>
            </div>

            <div className="customer-support">
              <h3>Need Help?</h3>
              <p>Contact our customer support team at support@infinitewavex.com or call +1 (555) 123-IWX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      <AddressForm
        isOpen={isAddressFormOpen}
        onClose={() => setIsAddressFormOpen(false)}
        onSave={handleSaveAddress}
        editAddress={editingAddress}
        userId={user?.id}
      />

      {/* Payment Form Modal */}
      <PaymentForm
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        onSave={handleSavePayment}
        editPayment={editingPayment}
        userId={user?.id}
      />

      <div className="checkout-features">
        <h2>Why Shop With IWX?</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>On all orders over $100</p>
          </div>
          <div className="feature">
            <div className="feature-icon">↩️</div>
            <h3>Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payment</h3>
            <p>Your data is protected</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💎</div>
            <h3>Quality Guarantee</h3>
            <p>Premium materials & craftsmanship</p>
          </div>
        </div>
      </div>

      <div className="recently-viewed-checkout">
        <h2>Complete Your Look</h2>
        <div className="viewed-products">
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80" alt="Product" />
            <div>
              <p>Luxury Watch</p>
              <span>$249.99</span>
            </div>
          </div>
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="Product" />
            <div>
              <p>Silk Scarf</p>
              <span>$39.99</span>
            </div>
          </div>
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80" alt="Product" />
            <div>
              <p>Casual Sneakers</p>
              <span>$89.99</span>
            </div>
          </div>
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1583744946564-b52ae1c3c559?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" alt="Product" />
            <div>
              <p>Leather Tote</p>
              <span>$129.99</span>
            </div>
          </div>
          <div className="viewed-product">
            <img src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt="Product" />
            <div>
              <p>Winter Parka</p>
              <span>$199.99</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
