import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import './ReturnRefund.css';

const ReturnRefund = () => {
  const [activeTab, setActiveTab] = useState('return');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('original');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock order data
  const orders = [
    {
      id: 'IWX-12345',
      date: '2025-05-15',
      items: [
        {
          id: 1,
          name: 'Premium Leather Jacket',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
          size: 'M',
          color: 'Black',
          quantity: 1,
          eligible: true
        },
        {
          id: 2,
          name: 'Designer Silk Dress',
          price: 149.99,
          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
          size: 'S',
          color: 'Navy',
          quantity: 1,
          eligible: true
        }
      ],
      status: 'delivered',
      total: 349.98
    },
    {
      id: 'IWX-12346',
      date: '2025-04-28',
      items: [
        {
          id: 3,
          name: 'Limited Edition Sneakers',
          price: 129.99,
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
          size: 'US 8',
          color: 'White',
          quantity: 1,
          eligible: true
        }
      ],
      status: 'delivered',
      total: 129.99
    }
  ];

  const returnReasons = [
    'Wrong size',
    'Wrong color',
    'Item defective',
    'Item damaged',
    'Not as described',
    'Changed my mind',
    'Other'
  ];

  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer free returns within 30 days of delivery. Items must be unworn, unwashed, and with original tags attached. Final sale items are not eligible for return.'
    },
    {
      question: 'How long does it take to process a refund?',
      answer: 'Once we receive your return, it takes 5-7 business days to process. Refunds will be issued to your original payment method and may take additional time to appear on your statement.'
    },
    {
      question: 'Do you offer exchanges?',
      answer: 'We currently don\'t offer direct exchanges. To exchange an item, please return the original item and place a new order for the desired item.'
    },
    {
      question: 'What if my item is damaged or defective?',
      answer: 'If you receive a damaged or defective item, please contact our customer service team within 7 days of delivery. We will provide a prepaid return label and process a full refund or replacement.'
    },
    {
      question: 'How do I return a gift?',
      answer: 'Gifts can be returned for store credit. Please include the gift receipt with your return. The refund will be issued as store credit to the original purchaser.'
    }
  ];

  const toggleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const handleSubmitReturn = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const selectedOrderData = orders.find(order => order.id === selectedOrder);
  const selectedItemsData = selectedOrderData 
    ? selectedOrderData.items.filter(item => selectedItems.includes(item.id))
    : [];

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => {
        document.querySelector('.search-input')?.focus();
      }, 100);
    }
  };

  return (
    <div className="return-refund-container">
      <Navbar />

      <div className="return-refund-header">
        <div className="header-content">
          <h1>InfiniteWaveX</h1>
          <p className="slogan">Designing Tomorrow, Today</p>
          <h2>Returns & Refunds</h2>
          <p className="tagline">Shaping Dreams with Timeless Waves</p>
        </div>
      </div>

      <div className="search-container">
        <button className="search-btn" onClick={toggleSearch}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z" fill="black"/>
          </svg>
        </button>
        <AnimatePresence>
          {searchOpen && (
            <motion.div 
              className="search-box"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <input 
                type="text" 
                className="search-input"
                placeholder="Search help articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isSubmitted ? (
        <div className="confirmation-section">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="confirmation-content"
          >
            <div className="confirmation-icon">✓</div>
            <h2>Return Request Submitted!</h2>
            <p>Your return request has been received. We've sent a confirmation email with next steps.</p>
            <p><strong>Return ID: RR-{Math.floor(Math.random() * 10000)}</strong></p>
            
            <div className="next-steps">
              <h3>Next Steps</h3>
              <ol>
                <li>Print the return label that was emailed to you</li>
                <li>Pack your items securely in the original packaging if possible</li>
                <li>Attach the return label to the package</li>
                <li>Drop off at any authorized shipping location</li>
              </ol>
            </div>

            <div className="confirmation-actions">
              <button className="btn-primary">View Return Status</button>
              <button className="btn-secondary">Continue Shopping</button>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={activeTab === 'return' ? 'active' : ''}
                onClick={() => setActiveTab('return')}
              >
                Start a Return
              </button>
              <button 
                className={activeTab === 'status' ? 'active' : ''}
                onClick={() => setActiveTab('status')}
              >
                Check Return Status
              </button>
              <button 
                className={activeTab === 'policy' ? 'active' : ''}
                onClick={() => setActiveTab('policy')}
              >
                Return Policy
              </button>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === 'return' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="return-form"
              >
                <div className="form-section">
                  <h3>Select Order to Return</h3>
                  <p>Choose the order containing the items you want to return</p>
                  
                  <div className="orders-grid">
                    {orders.map(order => (
                      <div 
                        key={order.id}
                        className={`order-card ${selectedOrder === order.id ? 'selected' : ''}`}
                        onClick={() => setSelectedOrder(order.id)}
                      >
                        <div className="order-header">
                          <span className="order-id">{order.id}</span>
                          <span className="order-date">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <div className="order-details">
                          <span className="items-count">{order.items.length} item(s)</span>
                          <span className="order-total">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrderData && (
                  <>
                    <div className="form-section">
                      <h3>Select Items to Return</h3>
                      <p>Choose which items you want to return from order {selectedOrder}</p>
                      
                      <div className="items-grid">
                        {selectedOrderData.items.map(item => (
                          <div 
                            key={item.id}
                            className={`item-card ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                            onClick={() => toggleItemSelection(item.id)}
                          >
                            <div className="item-image">
                              <img src={item.image} alt={item.name} />
                            </div>
                            <div className="item-details">
                              <h4>{item.name}</h4>
                              <p>{item.color} / {item.size}</p>
                              <p className="item-price">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="item-checkbox">
                              <input 
                                type="checkbox" 
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedItems.length > 0 && (
                      <div className="form-section">
                        <h3>Return Details</h3>
                        
                        <div className="form-group">
                          <label>Reason for Return</label>
                          <select 
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            required
                          >
                            <option value="">Select a reason</option>
                            {returnReasons.map(reason => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                        </div>

                        {returnReason === 'Other' && (
                          <div className="form-group">
                            <label>Please specify</label>
                            <textarea placeholder="Tell us more about why you're returning this item"></textarea>
                          </div>
                        )}

                        <div className="form-group">
                          <label>Refund Method</label>
                          <div className="refund-options">
                            <label className="refund-option">
                              <input 
                                type="radio" 
                                name="refundMethod" 
                                value="original"
                                checked={refundMethod === 'original'}
                                onChange={() => setRefundMethod('original')}
                              />
                              <span>Original payment method</span>
                            </label>
                            <label className="refund-option">
                              <input 
                                type="radio" 
                                name="refundMethod" 
                                value="storeCredit"
                                checked={refundMethod === 'storeCredit'}
                                onChange={() => setRefundMethod('storeCredit')}
                              />
                              <span>Store credit (processed faster)</span>
                            </label>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Additional Comments (Optional)</label>
                          <textarea placeholder="Is there anything else we should know?"></textarea>
                        </div>

                        <div className="return-summary">
                          <h4>Return Summary</h4>
                          <div className="summary-items">
                            {selectedItemsData.map(item => (
                              <div key={item.id} className="summary-item">
                                <span>{item.name}</span>
                                <span>${item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="summary-total">
                            <span>Estimated Refund</span>
                            <span>${selectedItemsData.reduce((total, item) => total + item.price, 0).toFixed(2)}</span>
                          </div>
                        </div>

                        <button 
                          className="submit-return-btn"
                          onClick={handleSubmitReturn}
                          disabled={isSubmitting || !returnReason}
                        >
                          {isSubmitting ? 'Processing...' : 'Submit Return Request'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'status' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="status-tab"
              >
                <div className="form-section">
                  <h3>Check Return Status</h3>
                  <p>Enter your return ID or order number to check the status of your return</p>
                  
                  <div className="status-search">
                    <input type="text" placeholder="Return ID or Order Number" />
                    <button className="btn-primary">Search</button>
                  </div>
                </div>

                <div className="return-status-example">
                  <h4>Recent Returns</h4>
                  <div className="status-cards">
                    <div className="status-card">
                      <div className="status-header">
                        <span className="return-id">RR-7582</span>
                        <span className="status-badge processing">Processing</span>
                      </div>
                      <div className="status-details">
                        <p>Items: Premium Leather Jacket</p>
                        <p>Requested: May 20, 2025</p>
                      </div>
                      <div className="status-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '50%'}}></div>
                        </div>
                        <div className="progress-labels">
                          <span className="active">Requested</span>
                          <span className="active">Received</span>
                          <span>Processing</span>
                          <span>Complete</span>
                        </div>
                      </div>
                    </div>

                    <div className="status-card">
                      <div className="status-header">
                        <span className="return-id">RR-6921</span>
                        <span className="status-badge completed">Completed</span>
                      </div>
                      <div className="status-details">
                        <p>Items: Designer Silk Dress</p>
                        <p>Requested: April 15, 2025</p>
                        <p>Refunded: $149.99 to original payment method</p>
                      </div>
                      <div className="status-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '100%'}}></div>
                        </div>
                        <div className="progress-labels">
                          <span className="active">Requested</span>
                          <span className="active">Received</span>
                          <span className="active">Processing</span>
                          <span className="active">Complete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'policy' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="policy-tab"
              >
                <div className="policy-section">
                  <h3>Return Policy</h3>
                  <div className="policy-card">
                    <h4>30-Day Return Policy</h4>
                    <p>We want you to be completely satisfied with your IWX purchase. If you're not happy with your order, we offer free returns within 30 days of delivery.</p>
                    
                    <div className="policy-details">
                      <div className="policy-point">
                        <span className="point-icon">✓</span>
                        <div>
                          <h5>Eligible Items</h5>
                          <p>Most unworn, unwashed items with original tags attached</p>
                        </div>
                      </div>
                      <div className="policy-point">
                        <span className="point-icon">✓</span>
                        <div>
                          <h5>Return Window</h5>
                          <p>30 days from delivery date</p>
                        </div>
                      </div>
                      <div className="policy-point">
                        <span className="point-icon">✓</span>
                        <div>
                          <h5>Return Method</h5>
                          <p>Free returns with prepaid shipping label</p>
                        </div>
                      </div>
                      <div className="policy-point">
                        <span className="point-icon">✗</span>
                        <div>
                          <h5>Non-Returnable Items</h5>
                          <p>Final sale items, underwear, swimwear, and personalized items</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="policy-section">
                  <h3>Refund Policy</h3>
                  <div className="policy-card">
                    <h4>How Refunds Work</h4>
                    <p>Once we receive and process your return, we will issue your refund based on your preferred method.</p>
                    
                    <div className="refund-timeline">
                      <div className="timeline-item">
                        <div className="timeline-marker">1</div>
                        <div className="timeline-content">
                          <h5>Return Received</h5>
                          <p>We process returns within 3-5 business days of receipt</p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-marker">2</div>
                        <div className="timeline-content">
                          <h5>Refund Initiated</h5>
                          <p>Refunds to original payment method take 5-10 business days</p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-marker">3</div>
                        <div className="timeline-content">
                          <h5>Store Credit</h5>
                          <p>Store credit is issued immediately and emailed to you</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="policy-section">
                  <h3>Frequently Asked Questions</h3>
                  <div className="faq-list">
                    {faqs.map((faq, index) => (
                      <div 
                        key={index}
                        className={`faq-item ${activeFAQ === index ? 'active' : ''}`}
                      >
                        <div 
                          className="faq-question"
                          onClick={() => toggleFAQ(index)}
                        >
                          <span>{faq.question}</span>
                          <span className="faq-toggle">{activeFAQ === index ? '−' : '+'}</span>
                        </div>
                        <AnimatePresence>
                          {activeFAQ === index && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="faq-answer"
                            >
                              <p>{faq.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}

      <div className="support-section">
        <h3>Need More Help?</h3>
        <p>Our customer service team is here to assist you with any questions about returns or refunds.</p>
        
        <div className="support-options">
          <div className="support-option">
            <div className="support-icon">📧</div>
            <h4>Email Us</h4>
            <p>returns@infinitewavex.com</p>
            <p>We typically respond within 24 hours</p>
          </div>
          <div className="support-option">
            <div className="support-icon">📞</div>
            <h4>Call Us</h4>
            <p>+1 (555) 123-IWX</p>
            <p>Mon-Fri, 9am-6pm EST</p>
          </div>
          <div className="support-option">
            <div className="support-icon">💬</div>
            <h4>Live Chat</h4>
            <p>Available on our website</p>
            <p>Mon-Fri, 9am-9pm EST</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefund;
