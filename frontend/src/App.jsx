import { useState, useEffect } from 'react'
import './App.css'
import './styles/global.css'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation} from "react-router-dom"
import Home from './pages/Home'
import ProductListing from './pages/ProductListing'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ProductDetails from './pages/ProductDetails'
import ReturnRefund from './pages/ReturnRefund'
import Offers from './pages/Offers'
import ModelViewer from './pages/ModelViewer'
import Status from './pages/Status'
import OrderTracking from './pages/OrderTracking'
import Dashboard from './pages/admin/Dashboard'
import ErrorPage from './pages/ErrorPage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import AdminRoute from './routes/AdminRoute'
import { useSelector, useDispatch } from 'react-redux'
import { loginSuccess, loginFailure, setLoading } from './redux/slices/authSlice'
import { setTheme } from './redux/slices/themeSlice'
import { authAPI } from './api/authAPI'
import { useServerStatus } from './hooks/useServerStatus'
import BackendServerDown from './components/BackendServerDown'
import FrontendServerDown from './components/FrontendServerDown'
import ThemeProvider from './components/ThemeProvider'

function AppContent() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const loading = useSelector(state => state.auth.loading)
  const { backendStatus, frontendStatus, retryChecks, checkBackendServices } = useServerStatus()
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const urlParams = new URLSearchParams(window.location.search);
      const googleCode = urlParams.get('code');

      // Handle Google OAuth callback
      if (googleCode && (window.location.pathname === '/auth' || window.location.pathname === '/auth/google/callback')) {
        try {
          const response = await authAPI.googleCallback(googleCode);
          if (!isMounted) return;

          const userRole = response.user?.role || 'user';
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('token', response.access_token);
          dispatch(loginSuccess({
            user: response.user,
            token: response.access_token
          }));

          // Set theme from user preferences
          if (response.user?.preferences && response.user.preferences.darkMode !== undefined) {
            dispatch(setTheme(response.user.preferences.darkMode));
          }
          // Clean up URL
          window.history.replaceState({}, document.title, '/');
          return;
        } catch (error) {
          if (!isMounted) return;
          console.error('Google OAuth callback error:', error);
          dispatch(loginFailure('Google authentication failed'));
        }
      }

      if (token) {
        try {
          // Check if remember me was used for this session
          const rememberMe = localStorage.getItem('rememberMe') === 'true';

          // For non-remember me sessions, we still validate the token
          // but the backend will handle expiration
          const user = await authAPI.getCurrentUser();
          if (!isMounted) return;

          if (user) {
            const userRole = user.role || 'user';
            localStorage.setItem('userRole', userRole);
            dispatch(loginSuccess({ user, token, rememberMe }));

            // Set theme from user preferences
            if (user.preferences && user.preferences.darkMode !== undefined) {
              dispatch(setTheme(user.preferences.darkMode));
            }
          } else {
            throw new Error('Failed to get user data');
          }
        } catch (error) {
          if (!isMounted) return;
          console.error('Auth initialization error:', error);
          // Check if it's a token expiration error (401)
          if (error.response?.status === 401) {
            console.log('Token expired, clearing authentication data');
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('rememberMe');
            dispatch(loginFailure('Session expired'));
          } else {
            dispatch(loginFailure(error.message));
          }
        }
      } else {
        if (isMounted) {
          dispatch(setLoading(false));
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>
  }

  // Allow access to status page even when backend is offline
  if (backendStatus === 'offline' && location.pathname !== '/status') {
    return <BackendServerDown onRetry={retryChecks} />
  }

  // Show frontend down page if frontend is offline (network issues)
  if (frontendStatus === 'offline') {
    return <FrontendServerDown onRetry={retryChecks} />
  }

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/adminDashboard' element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path='/productList' element={<ProductListing />} />
      <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path='/auth' element={<PublicRoute><Auth /></PublicRoute>} />
      <Route path='/auth/google/callback' element={<Auth />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />
      <Route path='/faq' element={<FAQ />} />
      <Route path='/cart' element={<Cart />} />
      <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path='/productDetails/:id' element={<ProductDetails />} />
      <Route path='/returnRefund' element={<ReturnRefund />} />
      <Route path='/offers' element={<Offers />} />
      <Route path='/modelViewer' element={<ModelViewer />} />
      <Route path='/orderTracking/:orderId' element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path='/status' element={<Status />} />
      <Route path='/error/404' element={<ErrorPage type="404" />} />
      <Route path='/error/500' element={<ErrorPage type="500" />} />
      <Route path='/error/network' element={<ErrorPage type="network" />} />
      <Route path='/error/timeout' element={<ErrorPage type="timeout" />} />
      <Route path='/error' element={<ErrorPage />} />
      <Route path='*' element={<ErrorPage type="404" />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App
