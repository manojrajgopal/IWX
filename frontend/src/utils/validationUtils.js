export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return String(value).length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return String(value).length <= maxLength;
};

export const validateNumeric = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const validateRange = (value, min, max) => {
  const num = parseFloat(value);
  return num >= min && num <= max;
};

export const getValidationError = (fieldName, value, rules) => {
  if (rules.required && !validateRequired(value)) {
    return `${fieldName} is required`;
  }

  if (rules.email && !validateEmail(value)) {
    return 'Please enter a valid email address';
  }

  if (rules.password && !validatePassword(value)) {
    return 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  if (rules.phone && !validatePhone(value)) {
    return 'Please enter a valid phone number';
  }

  if (rules.minLength && !validateMinLength(value, rules.minLength)) {
    return `${fieldName} must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && !validateMaxLength(value, rules.maxLength)) {
    return `${fieldName} must be no more than ${rules.maxLength} characters`;
  }

  if (rules.numeric && !validateNumeric(value)) {
    return `${fieldName} must be a number`;
  }

  if (rules.min !== undefined && !validateRange(value, rules.min, rules.max || Infinity)) {
    return `${fieldName} must be between ${rules.min} and ${rules.max || 'unlimited'}`;
  }

  return null;
};
