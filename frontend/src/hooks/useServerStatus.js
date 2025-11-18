import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export const useServerStatus = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [frontendStatus, setFrontendStatus] = useState('online');
  const [lastChecked, setLastChecked] = useState(null);
  const [storedPath, setStoredPath] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const checkInProgress = useRef(false);
  const intervalRef = useRef(null);

  const checkBackendStatus = useCallback(async () => {
    if (checkInProgress.current) {
      console.log('Backend check already in progress, skipping');
      return;
    }

    checkInProgress.current = true;
    const previousStatus = backendStatus;

    try {
      const response = await axios.get('http://localhost:8000/health', {
        timeout: 5000
      });

      if (response.status === 200 && response.data.status === 'healthy') {
        setBackendStatus('online');

        // If backend just came online and we have a stored path, redirect
        if (previousStatus === 'offline' && storedPath && storedPath !== '/status') {
          console.log('Backend is back online, redirecting to:', storedPath);
          navigate(storedPath);
          setStoredPath(null); // Clear stored path after redirect
        }
      } else {
        console.log('Backend response not healthy, setting status to offline');
        setBackendStatus('offline');
      }
    } catch (error) {
      console.log('Backend health check failed:', error.message, error.response?.status);
      setBackendStatus('offline');

      // Store current path if backend goes offline and we're not already on status page
      if (previousStatus === 'online' && location.pathname !== '/status') {
        setStoredPath(location.pathname);
        console.log('Backend went offline, stored path:', location.pathname);
      }
    } finally {
      setLastChecked(new Date());
      checkInProgress.current = false;
    }
  }, [backendStatus, storedPath, navigate, location.pathname]);

  const checkBackendServices = useCallback(async () => {
    try {
      console.log('Checking backend services...');
      const services = [
        { name: 'Users API', url: 'http://localhost:8000/admin/users?limit=1' },
        { name: 'Security Stats', url: 'http://localhost:8000/admin/security/stats' },
        { name: 'Login History', url: 'http://localhost:8000/admin/security/login-history?limit=1' }
      ];

      const results = {};
      for (const service of services) {
        try {
          const response = await axios.get(service.url, {
            timeout: 5000,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          results[service.name] = response.status === 200 ? 'online' : 'error';
        } catch (error) {
          results[service.name] = 'offline';
          console.log(`${service.name} check failed:`, error.message);
        }
      }

      console.log('Backend services status:', results);
      return results;
    } catch (error) {
      console.error('Failed to check backend services:', error);
      return null;
    }
  }, []);

  const checkFrontendStatus = useCallback(() => {
    // Check if we can reach the frontend server itself
    if (navigator.onLine) {
      // Try to fetch a static asset to verify frontend connectivity
      fetch('/vite.svg', { method: 'HEAD', cache: 'no-cache' })
        .then(response => {
          if (response.ok) {
            setFrontendStatus('online');
          } else {
            setFrontendStatus('offline');
          }
        })
        .catch(() => {
          setFrontendStatus('offline');
        });
    } else {
      setFrontendStatus('offline');
    }
  }, []);

  useEffect(() => {
    // Initial checks
    checkBackendStatus();
    checkFrontendStatus();

    // Set up periodic checks
    intervalRef.current = setInterval(() => {
      checkBackendStatus();
    }, 60000); // Check every 60 seconds to reduce rate limiting

    // Check immediately when coming back online
    const handleOnline = () => {
      checkBackendStatus();
      checkFrontendStatus();
    };

    const handleOffline = () => {
      setFrontendStatus('offline');
      setBackendStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkBackendStatus, checkFrontendStatus]);

  // Manual retry function
  const retryChecks = useCallback(() => {
    checkBackendStatus();
    checkFrontendStatus();
  }, [checkBackendStatus, checkFrontendStatus]);

  return {
    backendStatus,
    frontendStatus,
    lastChecked,
    retryChecks,
    storedPath,
    checkBackendServices
  };
};
