// OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar/Navbar';
import { orderAPI } from '../api/orderAPI';
import { productAPI } from '../api/productAPI';
import { authAPI } from '../api/authAPI';
import { updateUser } from '../redux/slices/authSlice';
import './OrderTracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [productImages, setProductImages] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        const orderData = await orderAPI.getOrderById(orderId);
        setOrder(orderData);

        // Set active tab from user preferences for this order
        const orderTabKey = `last_active_tab_order_${orderId}`;
        if (user?.preferences?.[orderTabKey]) {
          setActiveTab(user.preferences[orderTabKey]);
        }

        // Fetch product images for order items
        if (orderData.items && orderData.items.length > 0) {
          const images = {};
          for (const item of orderData.items) {
            const productId = item.product_id || item.id;
            if (productId && !images[productId]) {
              try {
                const productData = await productAPI.getProduct(productId);
                if (productData.images && productData.images.length > 0) {
                  images[productId] = productData.images[0];
                }
              } catch (err) {
                console.warn(`Failed to fetch image for product ${productId}:`, err);
              }
            }
          }
          setProductImages(images);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      confirmed: '#007bff',
      processing: '#17a2b8',
      shipped: '#28a745',
      delivered: '#20c997',
      cancelled: '#dc3545',
      refunded: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌',
      refunded: '💰'
    };
    return icons[status] || '📋';
  };

  const getStatusProgress = (status) => {
    const progress = {
      pending: 20,
      confirmed: 40,
      processing: 60,
      shipped: 80,
      delivered: 100,
      cancelled: 0,
      refunded: 100
    };
    return progress[status] || 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);

    // Save the active tab to user preferences for this specific order
    const orderTabKey = `last_active_tab_order_${orderId}`;
    const newPreferences = {
      ...user.preferences,
      [orderTabKey]: tabId
    };

    try {
      const updatedUser = await authAPI.updateCurrentUser({ preferences: newPreferences });
      dispatch(updateUser(updatedUser));
    } catch (err) {
      console.error('Error updating order tracking tab preference:', err);
    }
  };

  if (loading) {
    return (
      <div className="order-tracking-container">
        <Navbar />
        <motion.div 
          className="loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Loading order details...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-container">
        <Navbar />
        <motion.div 
          className="error-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="error-icon"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ⚠️
          </motion.div>
          <h2>Order Not Found</h2>
          <p>{error}</p>
          <motion.button 
            onClick={() => navigate('/profile')} 
            className="back-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Profile
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-container">
        <Navbar />
        <motion.div 
          className="error-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="error-icon"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📦
          </motion.div>
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <motion.button 
            onClick={() => navigate('/profile')} 
            className="back-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Profile
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      <Navbar />

      <motion.div 
        className="order-tracking-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container">
          <div className="order-header-content">
            <motion.div 
              className="order-title"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1>Order #{order.order_number}</h1>
              <motion.div 
                className="order-status-badge" 
                style={{ backgroundColor: getStatusColor(order.status) }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </motion.div>
            </motion.div>
            <motion.div 
              className="order-meta"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="meta-item">
                <span className="meta-label">Order Date:</span>
                <span className="meta-value">{formatDate(order.created_at)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Total:</span>
                <span className="meta-value total-amount">{formatCurrency(order.total_amount)}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="order-tracking-content">
        <div className="container">
          <motion.div 
            className="tracking-tabs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'items', label: 'Order Items' },
              { id: 'shipping', label: 'Shipping & Delivery' },
              { id: 'payment', label: 'Payment Details' },
              { id: 'timeline', label: 'Order Timeline' }
            ].map((tab, index) => (
              <motion.button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
                transition={{ duration: 0.3 }}
              >
                <div className="overview-grid">
                  <motion.div 
                    className="overview-card progress-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3>Order Progress</h3>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${getStatusProgress(order.status)}%` }}
                          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        ></motion.div>
                      </div>
                      <div className="progress-steps">
                        {[
                          { icon: '📋', label: 'Ordered', status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] },
                          { icon: '✅', label: 'Confirmed', status: ['confirmed', 'processing', 'shipped', 'delivered'] },
                          { icon: '⚙️', label: 'Processing', status: ['processing', 'shipped', 'delivered'] },
                          { icon: '🚚', label: 'Shipped', status: ['shipped', 'delivered'] },
                          { icon: '📦', label: 'Delivered', status: ['delivered'] }
                        ].map((step, index) => (
                          <motion.div
                            key={step.label}
                            className={`step ${step.status.includes(order.status) ? 'completed' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                          >
                            <div className="step-icon">{step.icon}</div>
                            <span>{step.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="overview-card summary-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3>Order Summary</h3>
                    <div className="summary-details">
                      {[
                        { label: 'Subtotal:', value: formatCurrency(order.subtotal) },
                        { label: 'Shipping:', value: order.shipping_cost === 0 ? 'FREE' : formatCurrency(order.shipping_cost) },
                        { label: 'Tax:', value: formatCurrency(order.tax_amount) },
                        { label: 'Total:', value: formatCurrency(order.total_amount), isTotal: true }
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          className={`summary-row ${item.isTotal ? 'total' : ''}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                        >
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div 
                    className="overview-card next-steps-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3>Next Steps</h3>
                    <div className="next-steps-content">
                      {order.status === 'pending' && (
                        <motion.div 
                          className="next-step"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1 }}
                        >
                          <div className="step-icon">⏳</div>
                          <div className="step-content">
                            <h4>Order Confirmation Pending</h4>
                            <p>We're reviewing your order. You'll receive a confirmation email shortly.</p>
                          </div>
                        </motion.div>
                      )}
                      {order.status === 'confirmed' && (
                        <motion.div 
                          className="next-step"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1 }}
                        >
                          <div className="step-icon">⚙️</div>
                          <div className="step-content">
                            <h4>Order Being Processed</h4>
                            <p>We're preparing your items for shipment. This usually takes 1-2 business days.</p>
                          </div>
                        </motion.div>
                      )}
                      {order.status === 'processing' && (
                        <motion.div 
                          className="next-step"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1 }}
                        >
                          <div className="step-icon">📦</div>
                          <div className="step-content">
                            <h4>Ready for Shipment</h4>
                            <p>Your order is packed and ready to ship. You'll receive tracking information soon.</p>
                          </div>
                        </motion.div>
                      )}
                      {order.status === 'shipped' && (
                        <motion.div 
                          className="next-step"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1 }}
                        >
                          <div className="step-icon">🚚</div>
                          <div className="step-content">
                            <h4>Out for Delivery</h4>
                            <p>Your order is on its way! Track your package using the tracking number below.</p>
                          </div>
                        </motion.div>
                      )}
                      {order.status === 'delivered' && (
                        <motion.div 
                          className="next-step"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1 }}
                        >
                          <div className="step-icon">✅</div>
                          <div className="step-content">
                            <h4>Order Delivered</h4>
                            <p>Your order has been successfully delivered. Enjoy your purchase!</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'items' && (
              <motion.div
                key="items"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
                transition={{ duration: 0.3 }}
              >
                <div className="order-items-section">
                  <h3>Order Items ({order.items?.length || 0})</h3>
                  <div className="order-items-list">
                    {order.items?.map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="order-item-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className="item-image">
                          <motion.img
                            src={productImages[item.product_id || item.id] ? `data:image/jpeg;base64,${productImages[item.product_id || item.id]}` : item.product?.images?.[0] ? `data:image/jpeg;base64,${item.product?.images?.[0]}` : item.image ? `data:image/jpeg;base64,${item.image}` : '/logo.png'}
                            alt={item.product?.name || item.name || 'Product'}
                            onError={(e) => {
                              e.target.src = '/logo.png';
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <div className="item-details">
                          <h4>{item.product?.name || item.name || 'Product Name'}</h4>
                          <div className="item-meta">
                            <span className="item-sku">SKU: {item.product?.sku || item.sku || 'N/A'}</span>
                            <span className="item-brand">Brand: {item.product?.brand || item.brand || 'N/A'}</span>
                          </div>
                          <div className="item-variants">
                            {item.size && <span className="variant">Size: {item.size}</span>}
                            {item.color && <span className="variant">Color: {item.color}</span>}
                          </div>
                          <div className="item-pricing">
                            <span className="quantity">Qty: {item.quantity}</span>
                            <span className="price">{formatCurrency(item.price)}</span>
                            <span className="subtotal">{formatCurrency(item.subtotal)}</span>
                          </div>
                        </div>
                        <div className="item-actions">
                          <motion.button
                            className="view-product-btn"
                            onClick={() => navigate(`/productDetails/${item.product_id || item.id}`)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View Product
                          </motion.button>
                        </div>
                      </motion.div>
                    )) || (
                      <div className="no-items">
                        <p>No items found in this order.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
                transition={{ duration: 0.3 }}
              >
                <div className="shipping-section">
                  <div className="shipping-grid">
                    <motion.div 
                      className="shipping-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3>Shipping Address</h3>
                      <div className="address-details">
                        <p className="address-name">
                          {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                        </p>
                        {order.shipping_address?.company && (
                          <p className="address-company">{order.shipping_address.company}</p>
                        )}
                        <p className="address-street">
                          {order.shipping_address?.address_line_1}
                        </p>
                        {order.shipping_address?.address_line_2 && (
                          <p className="address-street">{order.shipping_address.address_line_2}</p>
                        )}
                        <p className="address-city-state">
                          {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                        </p>
                        <p className="address-country">{order.shipping_address?.country}</p>
                        {order.shipping_address?.phone && (
                          <p className="address-phone">📞 {order.shipping_address.phone}</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div 
                      className="shipping-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3>Billing Address</h3>
                      <div className="address-details">
                        <p className="address-name">
                          {order.billing_address?.first_name} {order.billing_address?.last_name}
                        </p>
                        {order.billing_address?.company && (
                          <p className="address-company">{order.billing_address.company}</p>
                        )}
                        <p className="address-street">
                          {order.billing_address?.address_line_1}
                        </p>
                        {order.billing_address?.address_line_2 && (
                          <p className="address-street">{order.billing_address.address_line_2}</p>
                        )}
                        <p className="address-city-state">
                          {order.billing_address?.city}, {order.billing_address?.state} {order.billing_address?.postal_code}
                        </p>
                        <p className="address-country">{order.billing_address?.country}</p>
                        {order.billing_address?.phone && (
                          <p className="address-phone">📞 {order.billing_address.phone}</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div 
                      className="shipping-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3>Shipping Method</h3>
                      <div className="shipping-method-details">
                        <div className="method-name">
                          {order.shipping_method === 'standard' && '🚛 Standard Shipping'}
                          {order.shipping_method === 'express' && '⚡ Express Shipping'}
                          {order.shipping_method === 'overnight' && '🚀 Overnight Shipping'}
                        </div>
                        <div className="method-cost">
                          {order.shipping_cost === 0 ? 'FREE' : formatCurrency(order.shipping_cost)}
                        </div>
                        <div className="method-estimate">
                          {order.shipping_method === 'standard' && '3-5 business days'}
                          {order.shipping_method === 'express' && '1-2 business days'}
                          {order.shipping_method === 'overnight' && 'Next business day'}
                        </div>
                      </div>
                    </motion.div>

                    {order.tracking_number && (
                      <motion.div 
                        className="shipping-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h3>Tracking Information</h3>
                        <div className="tracking-details">
                          <div className="tracking-number">
                            <span className="tracking-label">Tracking Number:</span>
                            <span className="tracking-value">{order.tracking_number}</span>
                          </div>
                          <div className="tracking-carrier">
                            <span className="tracking-label">Carrier:</span>
                            <span className="tracking-value">UPS</span>
                          </div>
                          <motion.button 
                            className="track-package-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Track Package
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
                transition={{ duration: 0.3 }}
              >
                <div className="payment-section">
                  <div className="payment-grid">
                    <motion.div 
                      className="payment-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3>Payment Method</h3>
                      <div className="payment-method-details">
                        <div className="payment-type">
                          <span className="payment-icon">
                            {order.payment_method?.includes('credit') && '💳'}
                            {order.payment_method?.includes('paypal') && '🅿️'}
                            {order.payment_method?.includes('apple') && '🍎'}
                          </span>
                          <span className="payment-name">
                            {order.payment_method?.includes('credit') && 'Credit/Debit Card'}
                            {order.payment_method?.includes('paypal') && 'PayPal'}
                            {order.payment_method?.includes('apple') && 'Apple Pay'}
                            {!order.payment_method?.includes('credit') && !order.payment_method?.includes('paypal') && !order.payment_method?.includes('apple') && 'Payment Method'}
                          </span>
                        </div>
                        <div className="payment-status">
                          <span className="status-label">Status:</span>
                          <span className={`status-value ${order.payment_status}`}>
                            {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="payment-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3>Payment Breakdown</h3>
                      <div className="payment-breakdown">
                        {[
                          { label: 'Items Subtotal:', value: formatCurrency(order.subtotal) },
                          { label: 'Shipping:', value: order.shipping_cost === 0 ? 'FREE' : formatCurrency(order.shipping_cost) },
                          { label: 'Tax:', value: formatCurrency(order.tax_amount) },
                          ...(order.discount_amount > 0 ? [{ label: 'Discount:', value: `-${formatCurrency(order.discount_amount)}`, isDiscount: true }] : []),
                          { label: 'Total Paid:', value: formatCurrency(order.total_amount), isTotal: true }
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            className={`breakdown-row ${item.isDiscount ? 'discount' : ''} ${item.isTotal ? 'total' : ''}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <span>{item.label}</span>
                            <span>{item.value}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div 
                      className="payment-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3>Payment Timeline</h3>
                      <div className="payment-timeline">
                        <motion.div 
                          className="timeline-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="timeline-icon">💳</div>
                          <div className="timeline-content">
                            <h4>Payment Authorized</h4>
                            <p>{formatDate(order.created_at)}</p>
                          </div>
                        </motion.div>
                        {order.payment_status === 'paid' && (
                          <motion.div 
                            className="timeline-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="timeline-icon">✅</div>
                            <div className="timeline-content">
                              <h4>Payment Completed</h4>
                              <p>{formatDate(order.created_at)}</p>
                            </div>
                          </motion.div>
                        )}
                        {order.payment_status === 'refunded' && (
                          <motion.div 
                            className="timeline-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="timeline-icon">💰</div>
                            <div className="timeline-content">
                              <h4>Payment Refunded</h4>
                              <p>{formatDate(order.updated_at)}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
                transition={{ duration: 0.3 }}
              >
                <div className="timeline-section">
                  <h3>Order Timeline</h3>
                  <div className="order-timeline">
                    <motion.div 
                      className="timeline-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h4>Order Placed</h4>
                          <span className="timeline-date">{formatDate(order.created_at)}</span>
                        </div>
                        <p>Your order has been successfully placed and is being processed.</p>
                      </div>
                    </motion.div>

                    {order.status !== 'pending' && (
                      <motion.div 
                        className="timeline-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Confirmed</h4>
                            <span className="timeline-date">{formatDate(order.updated_at)}</span>
                          </div>
                          <p>Your order has been confirmed and payment has been processed.</p>
                        </div>
                      </motion.div>
                    )}

                    {(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
                      <motion.div 
                        className="timeline-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Processing</h4>
                            <span className="timeline-date">{formatDate(order.updated_at)}</span>
                          </div>
                          <p>Your order is being prepared for shipment.</p>
                        </div>
                      </motion.div>
                    )}

                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <motion.div 
                        className="timeline-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Shipped</h4>
                            <span className="timeline-date">{formatDate(order.shipped_at)}</span>
                          </div>
                          <p>Your order has been shipped and is on its way to you.</p>
                          {order.tracking_number && (
                            <p className="tracking-info">Tracking Number: {order.tracking_number}</p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {order.status === 'delivered' && (
                      <motion.div 
                        className="timeline-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="timeline-marker completed"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Delivered</h4>
                            <span className="timeline-date">{formatDate(order.delivered_at)}</span>
                          </div>
                          <p>Your order has been successfully delivered. Thank you for shopping with us!</p>
                        </div>
                      </motion.div>
                    )}

                    {order.status === 'cancelled' && (
                      <motion.div 
                        className="timeline-item cancelled"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Cancelled</h4>
                            <span className="timeline-date">{formatDate(order.updated_at)}</span>
                          </div>
                          <p>Your order has been cancelled.</p>
                          {order.notes && <p className="cancellation-notes">Reason: {order.notes}</p>}
                        </div>
                      </motion.div>
                    )}

                    {order.status === 'refunded' && (
                      <motion.div 
                        className="timeline-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="timeline-marker completed"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h4>Order Refunded</h4>
                            <span className="timeline-date">{formatDate(order.updated_at)}</span>
                          </div>
                          <p>Your order has been refunded. The amount will be credited to your original payment method.</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div 
        className="order-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="container">
          <div className="action-buttons">
            <motion.button 
              onClick={() => navigate('/productList')} 
              className="continue-shopping-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue Shopping
            </motion.button>
            <motion.button 
              onClick={() => navigate('/profile')} 
              className="back-to-orders-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to My Orders
            </motion.button>
            {order.status === 'delivered' && (
              <motion.button 
                className="return-order-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Request Return
              </motion.button>
            )}
            <motion.button 
              onClick={() => window.print()} 
              className="print-order-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Print Order
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderTracking;
