import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUser } from '../redux/slices/authSlice';
import { authAPI } from '../api/authAPI';
import { orderAPI } from '../api/orderAPI';
import { addressAPI } from '../api/addressAPI';
import { paymentAPI } from '../api/paymentAPI';
import { wishlistAPI } from '../api/wishlistAPI';
import { notificationAPI } from '../api/notificationAPI';
import { securityAPI } from '../api/securityAPI';
import './Profile.css';
import AddressForm from '../components/Profile/AddressForm';
import PaymentForm from '../components/Profile/PaymentForm';
import AlertBox from '../components/AlertBox';
import ErrorPage from './ErrorPage';
import { ChangePassword, TwoFactorAuth, LoginActivity, ConnectedDevices } from '../components/Profile/SecurityComponents';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [majorError, setMajorError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [preferences, setPreferences] = useState({
    emailNewsletter: true,
    smsNotifications: false,
    promotions: true,
    orderUpdates: true,
    stockAlerts: true,
    darkMode: false,
    pushNotifications: true,
    appUpdates: true
  });

  // Real data states
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    order_updates: true,
    payment_updates: true,
    shipping_updates: true,
    promotional_emails: true,
    product_alerts: true,
    security_alerts: true,
    system_notifications: true
  });
  const [securitySettings, setSecuritySettings] = useState({});
  const [billingHistory, setBillingHistory] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);

  // Loading states for each section
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  const [showLoginActivity, setShowLoginActivity] = useState(false);
  const [showConnectedDevices, setShowConnectedDevices] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  // Clear errors when changing tabs
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setUserData(user);
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        birthDate: user.birth_date || '',
        gender: user.gender || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });

      if (user.preferences) {
        setPreferences(user.preferences);
        // Set active tab from saved preference
        setActiveTab(user.preferences.last_active_section || 'profile');
      } else {
        setActiveTab('profile');
      }

      // Load real data for all sections with error handling
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      await Promise.allSettled([
        loadOrders(),
        loadAddresses(),
        loadPaymentMethods(),
        loadWishlist(),
        loadNotifications(),
        loadSecurityData()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setMajorError({
        type: 'network',
        message: 'Failed to load profile data',
        details: error.message
      });
    }
  };

  // Data loading functions with better error handling
  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderAPI.getOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      throw err;
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await addressAPI.getAddresses();
      setAddresses(response.addresses || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
      throw err;
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setLoadingPayments(true);
      const response = await paymentAPI.getPaymentMethods();
      setPaymentMethods(response.payments || []);
      setBillingHistory(response.billing_history || []);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      throw err;
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadWishlist = async () => {
    try {
      setLoadingWishlist(true);
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.items || []);
    } catch (err) {
      console.error('Error loading wishlist:', err);
      throw err;
    } finally {
      setLoadingWishlist(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const [notificationsResponse, preferencesResponse] = await Promise.all([
        notificationAPI.getNotifications(),
        notificationAPI.getNotificationPreferences()
      ]);
      setNotifications(notificationsResponse.notifications || []);
      if (preferencesResponse) {
        setNotificationPreferences(preferencesResponse);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      throw err;
    } finally {
      setLoadingNotifications(false);
    }
  };

  const loadSecurityData = async () => {
    try {
      setLoadingSecurity(true);
      const [settingsResponse, loginHistoryResponse, devicesResponse] = await Promise.all([
        securityAPI.getSecuritySettings(),
        securityAPI.getLoginHistory(),
        securityAPI.getConnectedDevices()
      ]);
      setSecuritySettings(settingsResponse || {});
      setLoginHistory(loginHistoryResponse || []);
      setConnectedDevices(devicesResponse || []);
    } catch (err) {
      console.error('Error loading security data:', err);
      throw err;
    } finally {
      setLoadingSecurity(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePreferenceChange = async (preference) => {
    const newPreferences = {
      ...preferences,
      [preference]: !preferences[preference]
    };
    setPreferences(newPreferences);

    try {
      const updatedUser = await authAPI.updateCurrentUser({ preferences: newPreferences });
      dispatch(updateUser(updatedUser));
    } catch (err) {
      console.error('Error updating preferences:', err);
      setPreferences(preferences);
    }
  };

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);

    // Save the active tab to user preferences
    const newPreferences = {
      ...preferences,
      last_active_section: tabId
    };
    setPreferences(newPreferences);

    try {
      const updatedUser = await authAPI.updateCurrentUser({ preferences: newPreferences });
      dispatch(updateUser(updatedUser));
    } catch (err) {
      console.error('Error updating active tab preference:', err);
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        birth_date: formData.birthDate,
        gender: formData.gender,
        address: formData.address,
        preferences: preferences
      };

      const updatedUser = await authAPI.updateCurrentUser(updateData);

      if (updatedUser) {
        dispatch(updateUser(updatedUser));
        setUserData(updatedUser);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        phone: userData.phone || '',
        birthDate: userData.birth_date || '',
        gender: userData.gender || '',
        address: userData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
      setPreferences(userData.preferences || {
        emailNewsletter: true,
        smsNotifications: false,
        promotions: true,
        orderUpdates: true,
        stockAlerts: true,
        darkMode: false,
        pushNotifications: true,
        appUpdates: true
      });
    }
    setIsEditing(false);
    setError('');
  };

  // CRUD operation handlers with better error handling
  const handleSetDefaultAddress = async (addressId) => {
    try {
      await addressAPI.setDefaultAddress(addressId);
      await loadAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressAPI.deleteAddress(addressId);
      await loadAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefaultPayment = async (paymentId) => {
    try {
      await paymentAPI.setDefaultPaymentMethod(paymentId);
      await loadPaymentMethods();
    } catch (err) {
      console.error('Error setting default payment:', err);
    }
  };

  const handleDeletePaymentMethod = async (paymentId) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      await paymentAPI.deletePaymentMethod(paymentId);
      await loadPaymentMethods();
    } catch (err) {
      console.error('Error deleting payment method:', err);
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await wishlistAPI.removeFromWishlist(itemId);
      await loadWishlist();
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  const handleNotificationPreferenceChange = async (preferenceKey, value) => {
    try {
      const updatedPreferences = {
        ...notificationPreferences,
        [preferenceKey]: value
      };
      setNotificationPreferences(updatedPreferences);

      await notificationAPI.updateNotificationPreferences(updatedPreferences);
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setNotificationPreferences(notificationPreferences);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4caf50';
      case 'processing': return '#ff9800';
      case 'shipped': return '#2196f3';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getInitials = () => {
    if (!userData) return 'U';
    return `${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}`.toUpperCase() || 'U';
  };

  // Show error page for major errors
  if (majorError) {
    return (
      <ErrorPage 
        type={majorError.type} 
        message={majorError.message}
        details={majorError.details}
      />
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading user data...</div>
      </div>
    );
  }

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      setError('');
      setSuccess('');
      if (editingAddress) {
        await addressAPI.updateAddress(editingAddress.id, addressData);
      } else {
        await addressAPI.createAddress(addressData);
      }
      await loadAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving address:', error);
      setError(error.response?.data?.detail || 'Failed to save address. Please try again.');
      setAlertType('error');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowPaymentForm(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
  };

  const handleSavePayment = async (paymentData) => {
    try {
      setError('');
      setSuccess('');
      if (editingPayment) {
        await paymentAPI.updatePaymentMethod(editingPayment.id, paymentData);
      } else {
        await paymentAPI.createPaymentMethod(paymentData);
      }
      await loadPaymentMethods();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving payment method:', error);
      setError('Failed to save payment method. Please try again.');
      setAlertType('error');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <h1>My Account</h1>
        <p>Manage your profile, orders, and preferences</p>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <AlertBox
            type="error"
            message={error}
            onClose={() => setError('')}
            autoHide={true}
            duration={5000}
          />
        )}
        {success && (
          <AlertBox
            type={alertType}
            message={success}
            onClose={() => setSuccess('')}
            autoHide={true}
            duration={3000}
          />
        )}
      </AnimatePresence>

      <div className="profile-content">
        {/* Sidebar */}
        <div className="profile-sidebar">
          {/* User Summary */}
          <div className="user-summary">
            <div className="user-avatar">
              {getInitials()}
            </div>
            <h2>{userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User' : 'User'}</h2>
            <p>{userData?.email || 'user@example.com'}</p>
            <p>Member since {userData ? new Date(userData.created_at).getFullYear() : '2024'}</p>
          </div>

          {/* Navigation */}
          <div className="profile-nav">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              ...(user?.role === 'admin' ? [{ id: 'dashboard', label: 'Dashboard', icon: '📊', isAdmin: true }] : []),
              { id: 'orders', label: 'Orders', icon: '📦' },
              { id: 'addresses', label: 'Addresses', icon: '🏠' },
              { id: 'payments', label: 'Payments', icon: '💳' },
              { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'security', label: 'Security', icon: '🔒' }
            ].map(item => (
              <button
                key={item.id}
                className={activeTab === item.id ? 'active' : ''}
                onClick={() => item.isAdmin ? window.location.href = '/adminDashboard' : handleTabChange(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <button
              className="logout-btn"
              onClick={() => dispatch(logout())}
              style={{ marginTop: '20px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}
            >
              <span>🚪</span>
              Logout
            </button>
          </div>

          {/* Account Stats */}
          <div className="account-stats">
            <h3>Account Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Orders</span>
              <span className="stat-value">{orders.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Wishlist</span>
              <span className="stat-value">{wishlist.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Addresses</span>
              <span className="stat-value">{addresses.length}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Personal Information</h2>
                    {!isEditing ? (
                      <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </button>
                    ) : (
                      <div>
                        <button className="cancel-btn" onClick={handleCancel}>
                          Cancel
                        </button>
                        <button className="save-btn" onClick={handleSave} disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-section">
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={userData?.email || 'user@example.com'}
                          disabled
                          style={{background: '#f5f5f5', color: '#666'}}
                        />
                        <small style={{color: '#666', fontSize: '12px'}}>Email cannot be changed</small>
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Birth Date</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Address Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Street Address</label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="form-group">
                        <label>ZIP Code</label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Country</label>
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="preferences-section">
                    <h3>App Preferences</h3>
                    <p>Customize your app experience</p>

                    <div className="preference-item">
                      <div>
                        <h4>Dark Mode</h4>
                        <p>Enable dark theme for the application</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.darkMode}
                          onChange={() => handlePreferenceChange('darkMode')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>Push Notifications</h4>
                        <p>Receive push notifications on your device</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.pushNotifications}
                          onChange={() => handlePreferenceChange('pushNotifications')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>App Updates</h4>
                        <p>Get notified about new app features and updates</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.appUpdates}
                          onChange={() => handlePreferenceChange('appUpdates')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="preferences-section">
                    <h3>Communication Preferences</h3>
                    <p>Manage how we communicate with you</p>

                    <div className="preference-item">
                      <div>
                        <h4>Email Newsletter</h4>
                        <p>Receive updates about new products and promotions</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.emailNewsletter}
                          onChange={() => handlePreferenceChange('emailNewsletter')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>SMS Notifications</h4>
                        <p>Get order updates via text message</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.smsNotifications}
                          onChange={() => handlePreferenceChange('smsNotifications')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>Promotional Emails</h4>
                        <p>Receive special offers and discounts</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.promotions}
                          onChange={() => handlePreferenceChange('promotions')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>Order Updates</h4>
                        <p>Get notified about your order status</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.orderUpdates}
                          onChange={() => handlePreferenceChange('orderUpdates')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="preference-item">
                      <div>
                        <h4>Stock Alerts</h4>
                        <p>Get notified when out-of-stock items are available</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={preferences.stockAlerts}
                          onChange={() => handlePreferenceChange('stockAlerts')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Order History</h2>
                  </div>
                  <div className="orders-list">
                    {loadingOrders ? (
                      <div className="loading-spinner">Loading orders...</div>
                    ) : orders.length === 0 ? (
                      <div className="empty-state">
                        <p>No orders found. Start shopping to see your order history!</p>
                      </div>
                    ) : (
                      orders.map(order => (
                        <div key={order.id} className="order-card">
                          <div className="order-header">
                            <div>
                              <h3>Order #{order.order_number}</h3>
                              <p>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <span
                              className="status-badge"
                              style={{backgroundColor: getStatusColor(order.status)}}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="order-details">
                            <div className="order-info">
                              <div className="info-item">
                                <span className="label">Items</span>
                                <span className="value">{order.items.length}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">Total</span>
                                <span className="value">${order.total_amount}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">Tracking</span>
                                <span className="value">{order.tracking_number || 'Not available'}</span>
                              </div>
                            </div>
                            <div className="order-actions">
                              <button className="action-btn">View Details</button>
                              <button className="action-btn" onClick={() => window.location.href = `/orderTracking/${order.id}`}>Track Order</button>
                              <button className="action-btn">Reorder</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Saved Addresses</h2>
                    <button className="add-address-btn" onClick={handleAddAddress}>
                      Add New Address
                    </button>
                  </div>

                  <div className="addresses-grid">
                    {loadingAddresses ? (
                      <div className="loading-spinner">Loading addresses...</div>
                    ) : addresses.length === 0 ? (
                      <div className="empty-state">
                        <p>No addresses saved. Add your first address to make checkout faster!</p>
                        <button className="add-address-btn" onClick={handleAddAddress}>
                          Add New Address
                        </button>
                      </div>
                    ) : (
                      addresses.map(address => (
                        <div key={address.id} className="address-card">
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
                              className="set-default-btn"
                              onClick={() => handleEditAddress(address)}
                            >
                              Edit
                            </button>
                            {!address.is_default && (
                              <button
                                className="set-default-btn"
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              className="remove-btn"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Payment Methods</h2>
                    <button className="add-payment-btn" onClick={handleAddPayment}>
                      Add Payment Method
                    </button>
                  </div>

                  <div className="payment-methods-list">
                    {loadingPayments ? (
                      <div className="loading-spinner">Loading payment methods...</div>
                    ) : paymentMethods.length === 0 ? (
                      <div className="empty-state">
                        <p>No payment methods saved. Add a payment method for faster checkout!</p>
                        <button className="add-payment-btn" onClick={handleAddPayment}>
                          Add Payment Method
                        </button>
                      </div>
                    ) : (
                      paymentMethods.map(payment => (
                        <div key={payment.id} className="payment-card">
                          <div className="payment-header">
                            <div className="payment-type">
                              <div className="card-icon">💳</div>
                              <div>
                                <h3>{payment.display_name}</h3>
                                {payment.expiry_month && (
                                  <p>Expires {payment.expiry_month}/{payment.expiry_year}</p>
                                )}
                              </div>
                            </div>
                            <div className="payment-actions">
                              <button 
                                className="action-btn"
                                onClick={() => handleEditPayment(payment)}
                              >
                                Edit
                              </button>
                              {!payment.is_default && (
                                <button
                                  className="set-default-btn"
                                  onClick={() => handleSetDefaultPayment(payment.id)}
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                className="remove-btn"
                                onClick={() => handleDeletePaymentMethod(payment.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>My Wishlist</h2>
                  </div>

                  <div className="wishlist-grid">
                    {loadingWishlist ? (
                      <div className="loading-spinner">Loading wishlist...</div>
                    ) : wishlist.length === 0 ? (
                      <div className="empty-state">
                        <p>Your wishlist is empty. Start browsing and save items you love!</p>
                      </div>
                    ) : (
                      wishlist.map(item => (
                        <div key={item.id} className="wishlist-item">
                          <div className="wishlist-image">
                            <img src={item.product?.images?.[0] || '/api/placeholder/300/300'} alt={item.product?.name || 'Product'} />
                            {item.product && item.product.inventory_quantity === 0 && <div className="out-of-stock">Out of Stock</div>}
                            <button
                              className="wishlist-remove"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                            >
                              ×
                            </button>
                          </div>
                          <div className="wishlist-details">
                            <h3>{item.product?.name || 'Product'}</h3>
                            <div className="wishlist-price">${item.product?.price || 'N/A'}</div>
                            <div className="wishlist-size">Size: {item.size || 'N/A'}</div>
                            <div className="wishlist-actions">
                              {item.product && item.product.inventory_quantity > 0 ? (
                                <button className="add-to-cart-btn">Add to Cart</button>
                              ) : (
                                <button className="notify-btn">Notify When Available</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Notification Settings</h2>
                  </div>

                  <div className="notifications-settings">
                    <div className="notification-category">
                      <h3>Email Notifications</h3>
                      <div className="notification-item">
                        <div>
                          <h4>Order Updates</h4>
                          <p>Get notified about your order status</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.order_updates || false}
                            onChange={(e) => handleNotificationPreferenceChange('order_updates', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div>
                          <h4>Promotional Emails</h4>
                          <p>Receive special offers and discounts</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.promotional_emails || false}
                            onChange={(e) => handleNotificationPreferenceChange('promotional_emails', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="notification-category">
                      <h3>Push Notifications</h3>
                      <div className="notification-item">
                        <div>
                          <h4>Order Alerts</h4>
                          <p>Get push notifications for order updates</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notificationPreferences.push_notifications || false}
                            onChange={(e) => handleNotificationPreferenceChange('push_notifications', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2>Security Settings</h2>
                  </div>

                  <div className="security-settings">
                    <div className="security-item">
                      <div>
                        <h3>Password</h3>
                        <p>Last changed 2 months ago</p>
                      </div>
                      <button 
                        className="change-password-btn"
                        onClick={() => setShowChangePassword(true)}
                      >
                        Change Password
                      </button>
                    </div>
                    <div className="security-item">
                      <div>
                        <h3>Two-Factor Authentication</h3>
                        <p>Add an extra layer of security to your account</p>
                      </div>
                      <button 
                        className="change-password-btn"
                        onClick={() => setShowTwoFactorAuth(true)}
                      >
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <AddressForm
                isOpen={showAddressForm}
                onClose={() => setShowAddressForm(false)}
                onSave={handleSaveAddress}
                editAddress={editingAddress}
                userId={user?.id}
              />

              <PaymentForm
                isOpen={showPaymentForm}
                onClose={() => setShowPaymentForm(false)}
                onSave={handleSavePayment}
                editPayment={editingPayment}
                userId={user?.id}
              />

              <ChangePassword
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
              />

              <TwoFactorAuth
                isOpen={showTwoFactorAuth}
                onClose={() => setShowTwoFactorAuth(false)}
              />

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
