// SecurityComponents.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { securityAPI } from '../../api/securityAPI';
import '../../pages/Profile.css';

const ChangePassword = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const passwordData = {
          current_password: formData.current_password,
          new_password: formData.new_password
        };

        // Call the security API
        await securityAPI.changePassword(passwordData);
        console.log('Password changed successfully');
        onClose();
      } catch (error) {
        console.error('Error changing password:', error);
        // Handle error (could show error message)
      }
    }
  };

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
              <h3>Change Password</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="security-form">
              <div className="form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  className={errors.current_password ? 'error' : ''}
                />
                {errors.current_password && <span className="error-message">{errors.current_password}</span>}
              </div>

              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className={errors.new_password ? 'error' : ''}
                />
                {errors.new_password && <span className="error-message">{errors.new_password}</span>}
              </div>

              <div className="form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className={errors.confirm_password ? 'error' : ''}
                />
                {errors.confirm_password && <span className="error-message">{errors.confirm_password}</span>}
              </div>

              <div className="password-requirements">
                <h4>Password Requirements:</h4>
                <ul>
                  <li>At least 8 characters long</li>
                  <li>Contains uppercase and lowercase letters</li>
                  <li>Includes numbers and special characters</li>
                </ul>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Change Password
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TwoFactorAuth = ({ isOpen, onClose }) => {
   const [step, setStep] = useState(1);
   const [verificationCode, setVerificationCode] = useState('');
   const [twoFactorData, setTwoFactorData] = useState(null);

   const handleEnable2FA = async () => {
     try {
       const response = await securityAPI.enableTwoFactor();
       console.log('2FA setup initiated:', response);
       setTwoFactorData(response);
       setStep(2);
     } catch (error) {
       console.error('Error enabling 2FA:', error);
     }
   };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const verificationData = { code: verificationCode.trim() };
      console.log('Attempting to verify 2FA with code:', verificationCode);
      await securityAPI.verifyTwoFactorSetup(verificationData);
      console.log('2FA enabled successfully');
      onClose();
    } catch (error) {
      console.error('Error verifying 2FA:', error);
    }
  };

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
              <h3>Two-Factor Authentication</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <div className="two-factor-content">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="step-info">
                    <div className="step-icon">🔒</div>
                    <h4>Secure Your Account</h4>
                    <p>Add an extra layer of security to your account by enabling two-factor authentication.</p>
                    
                    <div className="benefits-list">
                      <div className="benefit-item">
                        <span className="benefit-icon">✓</span>
                        <span>Protect against unauthorized access</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">✓</span>
                        <span>Receive login verification codes</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">✓</span>
                        <span>Enhanced account security</span>
                      </div>
                    </div>

                    <button className="enable-2fa-btn" onClick={handleEnable2FA}>
                      Enable 2FA
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="step-info">
                    <div className="step-icon">📱</div>
                    <h4>Set Up Authenticator App</h4>
                    <p>Scan the QR code with your authenticator app or enter the code manually.</p>
                    
                    <div className="qr-code-placeholder">
                      <div className="qr-code">
                        {twoFactorData?.provisioning_uri ? (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactorData.provisioning_uri)}`}
                            alt="2FA QR Code"
                            style={{ width: '200px', height: '200px' }}
                          />
                        ) : (
                          <div className="qr-placeholder">QR Code</div>
                        )}
                      </div>
                    </div>

                    <div className="manual-code">
                      <strong>Manual Entry Code:</strong>
                      <code>{twoFactorData?.secret || 'Loading...'}</code>
                    </div>

                    <form onSubmit={handleVerify} className="verification-form">
                      <div className="form-group">
                        <label>Enter Verification Code</label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="123456"
                          maxLength="6"
                          autoComplete="off"
                        />
                      </div>

                      <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                          Cancel
                        </button>
                        <button type="submit" className="save-btn">
                          Verify & Enable
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LoginActivity = ({ isOpen, onClose }) => {
  const loginHistory = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'New York, USA',
      time: '2 hours ago',
      status: 'Successful'
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'London, UK',
      time: '1 day ago',
      status: 'Successful'
    },
    {
      id: 3,
      device: 'Firefox on MacOS',
      location: 'Tokyo, Japan',
      time: '3 days ago',
      status: 'Failed'
    }
  ];

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
            className="modal-content large-modal"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Login Activity</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <div className="login-activity-content">
              <div className="activity-stats">
                <div className="stat-card">
                  <div className="stat-value">12</div>
                  <div className="stat-label">Successful Logins</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">1</div>
                  <div className="stat-label">Failed Attempts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">3</div>
                  <div className="stat-label">Active Devices</div>
                </div>
              </div>

              <div className="activity-list">
                <h4>Recent Activity</h4>
                {loginHistory.map(activity => (
                  <motion.div
                    key={activity.id}
                    className="activity-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: activity.id * 0.1 }}
                  >
                    <div className="activity-info">
                      <div className="activity-device">{activity.device}</div>
                      <div className="activity-details">
                        <span>{activity.location}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <div className={`activity-status ${activity.status.toLowerCase()}`}>
                      {activity.status}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="security-tips">
                <h4>Security Tips</h4>
                <ul>
                  <li>Always log out from shared devices</li>
                  <li>Use strong, unique passwords</li>
                  <li>Enable two-factor authentication</li>
                  <li>Review login activity regularly</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ConnectedDevices = ({ isOpen, onClose }) => {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: 'MacBook Pro',
      type: 'Laptop',
      browser: 'Chrome 119',
      lastActive: 'Currently active',
      location: 'New York, USA'
    },
    {
      id: 2,
      name: 'iPhone 14',
      type: 'Mobile',
      browser: 'Safari 16',
      lastActive: '2 hours ago',
      location: 'New York, USA'
    },
    {
      id: 3,
      name: 'Windows PC',
      type: 'Desktop',
      browser: 'Firefox 118',
      lastActive: '1 week ago',
      location: 'London, UK'
    }
  ]);

  const handleSignOutDevice = (deviceId) => {
    setDevices(devices.filter(device => device.id !== deviceId));
  };

  const handleSignOutAll = () => {
    setDevices(devices.filter(device => device.lastActive === 'Currently active'));
  };

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
            className="modal-content large-modal"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Connected Devices</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            <div className="devices-content">
              <div className="devices-header">
                <p>Manage devices that are currently logged into your account.</p>
                <button className="sign-out-all-btn" onClick={handleSignOutAll}>
                  Sign Out All Other Devices
                </button>
              </div>

              <div className="devices-list">
                {devices.map(device => (
                  <motion.div
                    key={device.id}
                    className="device-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: device.id * 0.1 }}
                  >
                    <div className="device-icon">
                      {device.type === 'Laptop' ? '💻' : 
                       device.type === 'Mobile' ? '📱' : '🖥️'}
                    </div>
                    <div className="device-info">
                      <div className="device-name">{device.name}</div>
                      <div className="device-details">
                        <span>{device.type}</span>
                        <span>•</span>
                        <span>{device.browser}</span>
                        <span>•</span>
                        <span>{device.location}</span>
                      </div>
                      <div className="device-last-active">{device.lastActive}</div>
                    </div>
                    <div className="device-actions">
                      {device.lastActive !== 'Currently active' && (
                        <button 
                          className="sign-out-btn"
                          onClick={() => handleSignOutDevice(device.id)}
                        >
                          Sign Out
                        </button>
                      )}
                      {device.lastActive === 'Currently active' && (
                        <span className="current-device">This Device</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="devices-footer">
                <h4>Device Security</h4>
                <ul>
                  <li>Only sign in on trusted devices</li>
                  <li>Keep your devices updated</li>
                  <li>Use antivirus software</li>
                  <li>Enable device encryption</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { ChangePassword, TwoFactorAuth, LoginActivity, ConnectedDevices };
