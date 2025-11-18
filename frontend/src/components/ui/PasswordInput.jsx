import React, { useState } from 'react';
import Input from './Input';
import Icon from './Icon';
import './PasswordInput.css';

const PasswordInput = ({
  name,
  placeholder = 'Password',
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`password-input-wrapper ${className}`}>
      <Input
        type={showPassword ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        error={error}
        required={required}
        {...props}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        <Icon name={showPassword ? 'eye' : 'eye'} />
      </button>
    </div>
  );
};

export default PasswordInput;
