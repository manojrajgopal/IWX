// PaymentForm.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../pages/Profile.css';

const PaymentForm = ({ isOpen, onClose, onSave, editPayment = null, userId }) => {
  const [formData, setFormData] = useState({
    card_number: editPayment?.credit_card?.card_number || editPayment?.card_number || '',
    expiry_month: editPayment?.credit_card?.expiry_month || editPayment?.expiry_month || '',
    expiry_year: editPayment?.credit_card?.expiry_year || editPayment?.expiry_year || '',
    cvv: editPayment?.credit_card?.cvv || '',
    card_holder: editPayment?.credit_card?.cardholder_name || editPayment?.card_holder || '',
    is_default: editPayment?.is_default || false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Format card number with spaces
    if (name === 'card_number') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.card_number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.card_number = 'Valid card number is required (16 digits)';
    }
    
    if (!formData.expiry_month || !formData.expiry_year) {
      newErrors.expiry = 'Expiry date is required';
    }
    
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Valid CVV is required';
    }
    
    if (!formData.card_holder.trim()) {
      newErrors.card_holder = 'Card holder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Transform form data to match backend model
        const cleanCardNumber = formData.card_number.replace(/\s/g, '');
        const paymentData = {
          user_id: userId,
          type: "credit_card", // Default to credit card
          is_default: formData.is_default,
          nickname: "",
          credit_card: {
            card_brand: "visa", // Could be detected from card number
            last_four: cleanCardNumber.slice(-4),
            card_number: cleanCardNumber, // Store complete card number
            expiry_month: parseInt(formData.expiry_month),
            expiry_year: parseInt(formData.expiry_year),
            cardholder_name: formData.card_holder,
            cvv: formData.cvv // Store CVV
          }
        };

        await onSave(paymentData);
        onClose();
      } catch (error) {
        console.error('Error saving payment method:', error);
        // Handle error (could show error message)
      }
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{editPayment ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="card-preview">
                <div className="card-front">
                  <div className="card-chip">⚫⚫</div>
                  <div className="card-number">
                    {formData.card_number || '•••• •••• •••• ••••'}
                  </div>
                  <div className="card-details">
                    <div className="card-holder">
                      <span>Card Holder</span>
                      <div>{formData.card_holder || 'YOUR NAME'}</div>
                    </div>
                    <div className="card-expiry">
                      <span>Expires</span>
                      <div>
                        {formData.expiry_month || 'MM'}/{formData.expiry_year?.slice(-2) || 'YY'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    name="card_number"
                    value={formData.card_number}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={errors.card_number ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.card_number && <span className="error-message">{errors.card_number}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Card Holder Name *</label>
                  <input
                    type="text"
                    name="card_holder"
                    value={formData.card_holder}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={errors.card_holder ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.card_holder && <span className="error-message">{errors.card_holder}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <div className="expiry-fields">
                    <select
                      name="expiry_month"
                      value={formData.expiry_month}
                      onChange={handleInputChange}
                      className={errors.expiry ? 'error' : ''}
                    >
                      <option value="">Month</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    <select
                      name="expiry_year"
                      value={formData.expiry_year}
                      onChange={handleInputChange}
                      className={errors.expiry ? 'error' : ''}
                    >
                      <option value="">Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  {errors.expiry && <span className="error-message">{errors.expiry}</span>}
                </div>
                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    className={errors.cvv ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={formData.is_default}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Set as default payment method
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editPayment ? 'Update Payment' : 'Add Payment'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentForm;
