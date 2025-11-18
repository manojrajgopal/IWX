// Product types
export const Product = {
  id: 'string|number',
  name: 'string',
  price: 'number',
  sale_price: 'number?',
  description: 'string',
  images: 'string[]',
  videos: 'string[]?',
  colors: 'string[]?',
  sizes: 'string[]?',
  category: 'string',
  rating: 'number?',
  review_count: 'number?',
  inventory_quantity: 'number?',
  sku: 'string?',
  features: 'string[]?',
  materials: 'object[]?',
  details: 'string?'
};

// User types
export const User = {
  id: 'string|number',
  name: 'string',
  email: 'string',
  role: 'string'
};

// Cart item types
export const CartItem = {
  id: 'string|number',
  product_id: 'string|number',
  product: 'Product',
  quantity: 'number',
  size: 'string',
  color: 'string',
  price: 'number'
};

// Review types
export const Review = {
  id: 'string|number',
  user: 'string',
  rating: 'number',
  comment: 'string',
  date: 'string',
  avatar: 'string?'
};

// Form field types
export const FormField = {
  name: 'string',
  type: 'string',
  label: 'string',
  placeholder: 'string?',
  required: 'boolean?',
  validation: 'object?'
};

// API response types
export const ApiResponse = {
  success: 'boolean',
  data: 'any',
  message: 'string?',
  error: 'string?'
};
