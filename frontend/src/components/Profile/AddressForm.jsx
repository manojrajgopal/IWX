// AddressForm.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../pages/Profile.css';

const AddressForm = ({ isOpen, onClose, onSave, editAddress = null, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false,
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Update form data when editAddress changes
  useEffect(() => {
    if (editAddress) {
      setFormData({
        name: editAddress.name || '',
        firstName: editAddress.first_name || '',
        lastName: editAddress.last_name || '',
        street: editAddress.street_address || '',
        city: editAddress.city || '',
        state: editAddress.state || '',
        postal_code: editAddress.postal_code || '',
        country: editAddress.country || '',
        is_default: editAddress.is_default || false,
        phone: editAddress.phone || ''
      });
    } else {
      // Reset form for new address
      setFormData({
        name: '',
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false,
        phone: ''
      });
    }
    setErrors({});
  }, [editAddress, isOpen]);

  const handleInputChange = async (e) => {
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

    // Auto-fill address based on postal code for India
    if (name === 'postal_code' && value.length === 6 && /^[0-9]+$/.test(value)) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await response.json();

        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city: postOffice.District || postOffice.Division || '',
            state: postOffice.State || '',
            country: 'India'
          }));
        }
      } catch (error) {
        console.error('Error fetching postal code data:', error);
      }
    }
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoadingLocation(true);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;

      // Use a geocoding service to get address from coordinates
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
      const data = await response.json();

      if (data) {
        // Try to get postal code from localityInfo if postcode is empty
        let postalCode = data.postcode || data.postalCode || '';
        if (!postalCode && data.localityInfo?.administrative) {
          // Look for postal code in administrative data
          const adminData = data.localityInfo.administrative;
          for (let i = 0; i < adminData.length; i++) {
            if (adminData[i].postalCode) {
              postalCode = adminData[i].postalCode;
              break;
            }
          }
        }

        setFormData(prev => ({
          ...prev,
          street: data.localityInfo?.administrative?.[2]?.name || data.locality || data.city || '',
          city: data.city || '',
          state: data.principalSubdivision || '',
          postal_code: postalCode,
          country: data.countryName || ''
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to detect location. Please check your browser permissions.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      name: '',
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false,
      phone: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Address name is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Transform form data to match backend model
        const addressData = {
          user_id: userId,
          name: formData.name,
          type: "home",
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: "",
          street_address: formData.street,
          apartment: "",
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          phone: formData.phone,
          is_default: formData.is_default
        };

        await onSave(addressData);
        onClose();
      } catch (error) {
        console.error('Error saving address:', error);
        throw error;
      }
    }
  };

  const countries = ['India', 'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'];

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
              <h3>{editAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="address-form">
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Address Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Home, Work"
                    className={errors.name ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={loadingLocation}
                    className="detect-location-btn"
                  >
                    {loadingLocation ? 'Detecting...' : 'Detect Location'}
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className={errors.firstName ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className={errors.lastName ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className={errors.street ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.street && <span className="error-message">{errors.street}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className={errors.city ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State/Province *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className={errors.state ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className={errors.postal_code ? 'error' : ''}
                    autoComplete="off"
                  />
                  {errors.postal_code && <span className="error-message">{errors.postal_code}</span>}
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={errors.country ? 'error' : ''}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && <span className="error-message">{errors.country}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    autoComplete="off"
                  />
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
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="clear-all-btn" onClick={handleClearForm}>
                  Clear All
                </button>
                <button type="submit" className="save-btn">
                  {editAddress ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddressForm;
