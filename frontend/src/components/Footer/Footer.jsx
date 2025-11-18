import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>IWX</h3>
            <p className="footer-slogan">Designing Tomorrow, Today</p>
            <p className="footer-tagline">Shaping Dreams with Timeless Waves</p>
            <div className="social-icons">
              <a href="#/" aria-label="Instagram">IG</a>
              <a href="#/" aria-label="Facebook">FB</a>
              <a href="#/" aria-label="Twitter">TW</a>
              <a href="#/" aria-label="Pinterest">PT</a>
              <a href="#/" aria-label="YouTube">YT</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>SHOP</h4>
            <ul>
              <li><a href="#/">Women</a></li>
              <li><a href="#/">Men</a></li>
              <li><a href="#/">Kids</a></li>
              <li><a href="#/">Beauty</a></li>
              <li><a href="#/">Accessories</a></li>
              <li><a href="#/">New Arrivals</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>HELP</h4>
            <ul>
              <li><a href="#/">Shipping & Returns</a></li>
              <li><a href="#/">Payment Methods</a></li>
              <li><a href="#/">Track Order</a></li>
              <li><a href="#/">FAQ</a></li>
              <li><a href="#/">Contact Us</a></li>
              <li><a href="#/">Size Guide</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>COMPANY</h4>
            <ul>
              <li><a href="#/">About Us</a></li>
              <li><a href="#/">Stores</a></li>
              <li><a href="#/">Careers</a></li>
              <li><a href="#/">Sustainability</a></li>
              <li><a href="#/">Privacy Policy</a></li>
              <li><a href="#/">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>CONTACT</h4>
            <ul>
              <li>123 Design Street</li>
              <li>Fashion District, FD 10001</li>
              <li>contact@infinitewavex.com</li>
              <li>+1 (555) 123-IWX</li>
            </ul>
            <div className="payment-methods">
              <span>We accept:</span>
              <div className="payment-icons">
                <span>Visa</span>
                <span>MC</span>
                <span>Amex</span>
                <span>PayPal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 InfiniteWaveX. ALL RIGHTS RESERVED.</p>
          <div className="footer-links">
            <a href="#/">Privacy Policy</a>
            <a href="#/">Terms of Service</a>
            <a href="#/">Accessibility</a>
            <a href="#/">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
