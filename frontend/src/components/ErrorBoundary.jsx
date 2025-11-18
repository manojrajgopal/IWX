// ErrorBoundary.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <div className="error-container">
            <div className="error-animation">
              <UnexpectedAnimation />
            </div>
            
            <h1 className="error-code">ERROR</h1>
            <h2 className="error-title">Something Went Wrong</h2>
            <p className="error-message">
              We apologize, but something unexpected happened. Our team has been notified 
              and we're working to fix it. In the meantime, you can try refreshing the page.
            </p>

            {/* Action Buttons */}
            <div className="error-actions">
              <motion.button
                className="btn-primary"
                onClick={this.handleRetry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
              
              <motion.button
                className="btn-secondary"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Refresh Page
              </motion.button>
            </div>

            {/* Error Details */}
            <details className="error-details">
              <summary>Technical Details</summary>
              <div className="details-content">
                {this.state.error && (
                  <div className="detail-section">
                    <h4>Error</h4>
                    <pre className="debug-code">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                )}
                
                {this.state.errorInfo?.componentStack && (
                  <div className="detail-section">
                    <h4>Component Stack</h4>
                    <pre className="debug-code">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>

            {/* Support Information */}
            <div className="support-section">
              <p>If the problem persists, please contact our support team.</p>
              <div className="support-links">
                <a href="/contact" className="support-link">Contact Support</a>
                <a href="/" className="support-link">Go Home</a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Unexpected Error Animation
const UnexpectedAnimation = () => {
  const [shake, setShake] = React.useState(false);
  const [particles, setParticles] = React.useState([]);

  React.useEffect(() => {
    // Shake animation
    const shakeInterval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }, 3000);

    // Particle effect
    const particleInterval = setInterval(() => {
      setParticles(Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      })));
      setTimeout(() => setParticles([]), 500);
    }, 2000);

    return () => {
      clearInterval(shakeInterval);
      clearInterval(particleInterval);
    };
  }, []);

  return (
    <motion.div
      className="unexpected-animation"
      animate={{ x: shake ? [-5, 5, -5, 5, 0] : 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="error-symbol">
        <motion.div
          className="error-x x1"
          animate={{ rotate: 45 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="error-x x2"
          animate={{ rotate: -45 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="error-circle"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="error-particle"
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 1
            }}
            animate={{
              scale: 1,
              opacity: 0,
              x: particle.x + (Math.random() - 0.5) * 50,
              y: particle.y + (Math.random() - 0.5) * 50
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        ))}
      </AnimatePresence>
      <motion.div
        className="question-mark"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ❓
      </motion.div>
    </motion.div>
  );
};

export default ErrorBoundary;
