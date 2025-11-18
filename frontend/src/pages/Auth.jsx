// Auth.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAPI } from '../api/authAPI';
import { loginSuccess } from '../redux/slices/authSlice';
import apiService from '../services/api';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import LoadingSpinner from '../components/LoadingSpinner';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: true,
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);




  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
          remember_me: formData.rememberMe
        });
        // Store user role in localStorage
        const userRole = response.user?.role || 'user';
        localStorage.setItem('userRole', userRole);

        // Dispatch login success to Redux store
        dispatch(loginSuccess({
          user: response.user,
          token: response.access_token,
          rememberMe: false // Google login doesn't have remember me
        }));
        navigate('/');
      } else {
        await authAPI.register({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
          newsletter_subscription: formData.newsletter
        });
        // After registration, automatically log in
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        // Store user role in localStorage
        const userRole = response.user?.role || 'user';
        localStorage.setItem('userRole', userRole);

        // Dispatch login success to Redux store
        dispatch(loginSuccess({
          user: response.user,
          token: response.access_token,
          rememberMe: false // Registration doesn't have remember me
        }));
        navigate('/');
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.detail || error.message || 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.googleLogin();
      // Redirect to Google OAuth URL
      window.location.href = response.auth_url;
    } catch (error) {
      setErrors({ general: error.response?.data?.detail || error.message || 'Failed to initiate Google login' });
      setIsLoading(false);
    }
  };

  // Handle Google OAuth callback via URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const error = urlParams.get('error');

    if (error === 'google_auth_failed') {
      setErrors({ general: 'Google authentication failed. Please try again.' });
      // Clear URL parameters
      window.history.replaceState({}, document.title, '/auth');
      return;
    }

    if (sessionId && window.location.pathname === '/auth/google/callback') {
      // Fetch auth data from backend using session ID
      fetchAuthData(sessionId);
    }
  }, []);

  const fetchAuthData = async (sessionId) => {
    try {
      setIsLoading(true);
      const response = await authAPI.getGoogleAuthData(sessionId);

      // Store user role in localStorage
      const userRole = response.user?.role || 'user';
      localStorage.setItem('userRole', userRole);

      // Dispatch login success to Redux store
      dispatch(loginSuccess({
        user: response.user,
        token: response.access_token,
        rememberMe: formData.rememberMe
      }));

      // Clear URL parameters and redirect to home
      window.history.replaceState({}, document.title, '/');
      navigate('/');
    } catch (error) {
      setErrors({ general: error.response?.data?.detail || error.message || 'Failed to complete authentication' });
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* Left side - Branding */}
        <motion.div
          className="auth-branding"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="brand-logo" onClick={() => navigate('/')}>IWX</div>
          <h1 onClick={() => navigate('/')}>InfiniteWaveX</h1>
          <p className="slogan" onClick={() => navigate('/')}>Designing Tomorrow, Today</p>
          <p className="tagline" onClick={() => navigate('/')}>Shaping Dreams with Timeless Waves</p>
          
          <div className="brand-features">
            <div className="feature">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Fast checkout</div>
            </div>
            <div className="feature">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Multiple delivery options</div>
            </div>
            <div className="feature">
              <div className="feature-icon">✓</div>
              <div className="feature-text">Exclusive member discounts</div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div 
          className="auth-form-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="auth-form-wrapper"
            >
              <div className="form-header">
                <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
                <p>{isLogin ? 'Welcome back to IWX' : 'Join the IWX community'}</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                  <div className="form-row">
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={errors.firstName}
                      required
                    />
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={errors.lastName}
                      required
                    />
                  </div>
                )}

                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                />

                <PasswordInput
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  required
                />

                {!isLogin && (
                  <>
                  <PasswordInput
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    required
                  />

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="newsletter"
                          checked={formData.newsletter}
                          onChange={handleInputChange}
                        />
                        <span className="checkmark"></span>
                        Subscribe to our newsletter for updates and exclusive offers
                      </label>
                    </div>
                  </>
                )}

                {isLogin && (
                  <div className="form-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Remember me
                    </label>
                    <a href="#forgot" className="forgot-link">Forgot password?</a>
                  </div>
                )}

                <button 
                  type="submit" 
                  className={`submit-btn ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    isLogin ? 'Login' : 'Create Account'
                  )}
                </button>

                <div className="social-login">
                  <p>Or continue with</p>
                  <div className="social-buttons">
                    <button type="button" className="social-btn google" onClick={handleGoogleLogin} disabled={isLoading}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M16.5 9.18182C16.5 8.64091 16.4455 8.07727 16.3636 7.54545H9V10.5H13.2955C13.1155 11.3964 12.59 12.1818 11.8227 12.6818V14.5591H14.1773C15.5545 13.3136 16.5 11.4227 16.5 9.18182Z" fill="#4285F4"/>
                        <path d="M9 17C11.05 17 12.7955 16.2545 14.1773 14.5591L11.8227 12.6818C11.0773 13.1591 10.0955 13.4318 9 13.4318C6.99545 13.4318 5.28636 12.0227 4.63182 10.0455H2.18636V12.0227C3.56818 14.6591 6.13636 17 9 17Z" fill="#34A853"/>
                        <path d="M4.63182 10.0455C4.36364 9.27273 4.36364 8.40909 4.63182 7.63636V5.65909H2.18636C1.29545 7.43182 1.29545 9.5 2.18636 11.2727L4.63182 10.0455Z" fill="#FBBC05"/>
                        <path d="M9 4.56818C10.15 4.56818 11.1818 4.97727 12.0045 5.79545L14.2364 3.56364C12.7909 2.20909 10.95 1.5 9 1.5C6.13636 1.5 3.56818 3.84091 2.18636 6.47727L4.63182 8.45455C5.28636 6.47727 6.99545 5.06818 9 5.06818V4.56818Z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>
                    <button type="button" className="social-btn facebook">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 12.6777 4.1565 15.7024 7.64062 16.3828V11.1328H5.56641V9H7.64062V7.35938C7.64062 5.47559 8.83594 4.38281 10.5527 4.38281C11.3777 4.38281 12.2344 4.53516 12.2344 4.53516V6.28125H11.2852C10.3491 6.28125 10.0078 6.88477 10.0078 7.5V9H12.1406L11.7891 11.1328H10.0078V16.3828C13.4919 15.7024 16.5 12.6777 16.5 9Z" fill="white"/>
                      </svg>
                      Facebook
                    </button>
                  </div>
                </div>

                {errors.general && (
                  <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                    {errors.general}
                  </div>
                )}

                <div className="form-footer">
                  <p>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button type="button" className="toggle-form-btn" onClick={toggleForm}>
                      {isLogin ? 'Sign up' : 'Login'}
                    </button>
                  </p>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Additional content for scrolling */}
      <div className="auth-additional-content">
        <div className="container">
          <h2>Why Join InfiniteWaveX?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🎁</div>
              <h3>Exclusive Offers</h3>
              <p>Get access to members-only sales and special promotions</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🚚</div>
              <h3>Fast Shipping</h3>
              <p>Free standard shipping on all orders over $50</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⭐</div>
              <h3>Rewards Program</h3>
              <p>Earn points with every purchase and redeem for discounts</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">❤️</div>
              <h3>Wish Lists</h3>
              <p>Save your favorite items for later and get notified when they go on sale</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">↩️</div>
              <h3>Easy Returns</h3>
              <p>Free returns within 30 days for all members</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">👑</div>
              <h3>VIP Access</h3>
              <p>Be the first to know about new collections and limited editions</p>
            </div>
          </div>

          <div className="testimonials-section">
            <h2>What Our Members Say</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p>"IWX has completely transformed my shopping experience. The personalized recommendations are always spot on!"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">S</div>
                  <div className="author-info">
                    <h4>Sarah Johnson</h4>
                    <p>Member since 2022</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p>"The rewards program is incredible! I've saved so much with the points I've earned from my purchases."</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">M</div>
                  <div className="author-info">
                    <h4>Michael Chen</h4>
                    <p>Member since 2021</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p>"Fast shipping, easy returns, and amazing customer service. IWX is my go-to for all fashion needs."</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">E</div>
                  <div className="author-info">
                    <h4>Emily Rodriguez</h4>
                    <p>Member since 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>How do I reset my password?</h3>
                <p>Click on "Forgot password" on the login page and enter your email address. We'll send you a link to reset your password.</p>
              </div>
              <div className="faq-item">
                <h3>What are the benefits of creating an account?</h3>
                <p>Members enjoy faster checkout, order tracking, wish lists, exclusive offers, and rewards points on every purchase.</p>
              </div>
              <div className="faq-item">
                <h3>Is my personal information secure?</h3>
                <p>Yes, we use industry-standard encryption to protect your data and never share your information with third parties.</p>
              </div>
              <div className="faq-item">
                <h3>How do I update my account information?</h3>
                <p>Once logged in, you can update your personal information, password, and communication preferences in your account dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
