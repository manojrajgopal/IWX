import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../api/productAPI';
import './AddProductForm.css';

// Helper function to convert file to Base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const AddProductForm = ({ onClose, onSuccess, editingProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    category: '',
    brand: '',
    sku: '',
    status: 'active',
    inventory_quantity: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    seo_title: '',
    seo_description: '',
    sizes: [],
    colors: [],
    tags: [],
    attributes: {},
    images: [],
    videos: []
  });

  // Initialize form data if editing
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price || '',
        sale_price: editingProduct.sale_price || '',
        category: editingProduct.category || '',
        brand: editingProduct.brand || '',
        sku: editingProduct.sku || '',
        status: editingProduct.status || 'active',
        inventory_quantity: editingProduct.inventory_quantity || '',
        weight: editingProduct.weight || '',
        dimensions: editingProduct.dimensions || { length: '', width: '', height: '' },
        seo_title: editingProduct.seo_title || '',
        seo_description: editingProduct.seo_description || '',
        sizes: editingProduct.sizes || [],
        colors: editingProduct.colors || [],
        tags: editingProduct.tags || [],
        attributes: editingProduct.attributes || {},
        images: editingProduct.images || [],
        videos: editingProduct.videos || []
      });
    }
  }, [editingProduct]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const categories = [
    { value: 'woman', label: 'Woman' },
    { value: 'man', label: 'Man' },
    { value: 'kids', label: 'Kids' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'beauty', label: 'Beauty' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    }));
  };

  const handleArrayInput = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 6) {
      setErrors(prev => ({ ...prev, images: 'Maximum 6 images allowed' }));
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    setErrors(prev => ({ ...prev, images: '' }));

    // Convert files to Base64 and create preview URLs
    const processFiles = async () => {
      const newBase64Images = [];
      const newPreviews = [];

      for (const file of files) {
        try {
          const base64 = await convertFileToBase64(file);
          newBase64Images.push(base64);
          // Create preview URL for display
          newPreviews.push(URL.createObjectURL(file));
        } catch (error) {
          console.error('Error converting image to Base64:', error);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newBase64Images]
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    processFiles();
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + videoFiles.length > 2) {
      setErrors(prev => ({ ...prev, videos: 'Maximum 2 videos allowed' }));
      return;
    }

    setVideoFiles(prev => [...prev, ...files]);
    setErrors(prev => ({ ...prev, videos: '' }));

    // Convert files to Base64 and create preview URLs
    const processFiles = async () => {
      const newBase64Videos = [];
      const newPreviews = [];

      for (const file of files) {
        try {
          const base64 = await convertFileToBase64(file);
          newBase64Videos.push(base64);
          // Create preview URL for display
          newPreviews.push(URL.createObjectURL(file));
        } catch (error) {
          console.error('Error converting video to Base64:', error);
        }
      }

      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...newBase64Videos]
      }));
      setVideoPreviews(prev => [...prev, ...newPreviews]);
    };

    processFiles();
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImageFiles(newImageFiles);
    setImagePreviews(newPreviews);
  };

  const removeVideo = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    const newVideoFiles = videoFiles.filter((_, i) => i !== index);
    const newPreviews = videoPreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, videos: newVideos }));
    setVideoFiles(newVideoFiles);
    setVideoPreviews(newPreviews);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (formData.images.length < 1) newErrors.images = 'At least 1 image is required';
      if (formData.images.length > 6) newErrors.images = 'Maximum 6 images allowed';
      if (formData.videos.length > 2) newErrors.videos = 'Maximum 2 videos allowed';
    }

    if (step === 2) {
      if (!formData.name.trim()) newErrors.name = 'Product name is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        newErrors.price = 'Valid price is required';
      }
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
      if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    }

    if (step === 3) {
      if (!formData.inventory_quantity || isNaN(formData.inventory_quantity) || parseInt(formData.inventory_quantity) < 0) {
        newErrors.inventory_quantity = 'Valid inventory quantity is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only allow submission on the final step (step 3)
    if (currentStep !== 3) return;

    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        inventory_quantity: parseInt(formData.inventory_quantity),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: Object.values(formData.dimensions).some(v => v) ?
          Object.fromEntries(
            Object.entries(formData.dimensions)
              .filter(([_, v]) => v)
              .map(([k, v]) => [k, parseFloat(v)])
          ) : null
      };

      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === null || submitData[key] === undefined || submitData[key] === '') {
          delete submitData[key];
        }
      });

      if (editingProduct) {
        await productAPI.updateProduct(editingProduct.id, submitData);
      } else {
        await productAPI.createProduct(submitData);
      }
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      if (error.response?.status === 529) {
        console.log('Server overloaded, retrying save in 2 seconds...');
        setTimeout(() => handleSubmit({ preventDefault: () => {} }), 2000);
      } else {
        setErrors({ submit: error.response?.data?.detail || 'Failed to save product' });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [1, 2, 3];

    return (
      <div className="step-indicator">
        {steps.map(step => {
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const isAccessible = step === 1 || (step > 1 && currentStep >= step);

          return (
            <button
              key={step}
              className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => isAccessible && setCurrentStep(step)}
              disabled={!isAccessible}
            >
              <span className="step-number">{step}</span>
              <span className="step-label">
                {step === 1 ? 'Media' : step === 2 ? 'Basic Info' : 'Inventory'}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderBasicInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-step"
    >
      <div className="form-row">
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label>SKU *</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            placeholder="Enter SKU"
            className={errors.sku ? 'error' : ''}
          />
          {errors.sku && <span className="error-text">{errors.sku}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter product description"
          rows={4}
          className={errors.description ? 'error' : ''}
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <span className="error-text">{errors.price}</span>}
        </div>
        <div className="form-group">
          <label>Sale Price</label>
          <input
            type="number"
            name="sale_price"
            value={formData.sale_price}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>
        <div className="form-group">
          <label>Brand *</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="Enter brand name"
            className={errors.brand ? 'error' : ''}
          />
          {errors.brand && <span className="error-text">{errors.brand}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleInputChange}>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Dimensions (L x W x H in cm)</label>
        <div className="dimensions-input">
          <input
            type="number"
            placeholder="Length"
            value={formData.dimensions.length}
            onChange={(e) => handleDimensionChange('length', e.target.value)}
            step="0.01"
            min="0"
          />
          <span>x</span>
          <input
            type="number"
            placeholder="Width"
            value={formData.dimensions.width}
            onChange={(e) => handleDimensionChange('width', e.target.value)}
            step="0.01"
            min="0"
          />
          <span>x</span>
          <input
            type="number"
            placeholder="Height"
            value={formData.dimensions.height}
            onChange={(e) => handleDimensionChange('height', e.target.value)}
            step="0.01"
            min="0"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderMediaUpload = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-step"
    >
      <div className="form-group">
        <label>Product Images * (1-6 images)</label>
        <div className="upload-area">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="upload-btn"
            onClick={() => imageInputRef.current?.click()}
          >
            📷 Choose Images
          </button>
          <span className="upload-info">{formData.images.length}/6 images selected</span>
        </div>
        {errors.images && <span className="error-text">{errors.images}</span>}

        <div className="media-preview">
           {imagePreviews.map((preview, index) => (
             <div key={index} className="media-item">
               <img src={preview} alt={`Product ${index + 1}`} />
               <button
                 type="button"
                 className="remove-media"
                 onClick={() => removeImage(index)}
               >
                 ✕
               </button>
             </div>
           ))}
         </div>
      </div>

      <div className="form-group">
        <label>Product Videos (Optional, max 2)</label>
        <div className="upload-area">
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideoUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="upload-btn"
            onClick={() => videoInputRef.current?.click()}
          >
            🎥 Choose Videos
          </button>
          <span className="upload-info">{formData.videos.length}/2 videos selected</span>
        </div>
        {errors.videos && <span className="error-text">{errors.videos}</span>}

        <div className="media-preview">
           {videoPreviews.map((preview, index) => (
             <div key={index} className="media-item">
               <video src={preview} controls />
               <button
                 type="button"
                 className="remove-media"
                 onClick={() => removeVideo(index)}
               >
                 ✕
               </button>
             </div>
           ))}
         </div>
      </div>
    </motion.div>
  );

  const renderInventoryDetails = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-step"
    >
      <div className="form-row">
        <div className="form-group">
          <label>Inventory Quantity *</label>
          <input
            type="number"
            name="inventory_quantity"
            value={formData.inventory_quantity}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            className={errors.inventory_quantity ? 'error' : ''}
          />
          {errors.inventory_quantity && <span className="error-text">{errors.inventory_quantity}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Sizes (comma-separated)</label>
        <input
          type="text"
          value={formData.sizes.join(', ')}
          onChange={(e) => handleArrayInput('sizes', e.target.value)}
          placeholder="S, M, L, XL"
        />
      </div>

      <div className="form-group">
        <label>Colors (comma-separated)</label>
        <input
          type="text"
          value={formData.colors.join(', ')}
          onChange={(e) => handleArrayInput('colors', e.target.value)}
          placeholder="Red, Blue, Green"
          title="Enter colors separated by commas. Spaces and commas are allowed."
        />
      </div>

      <div className="form-group">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags.join(', ')}
          onChange={(e) => handleArrayInput('tags', e.target.value)}
          placeholder="summer, sale, new"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>SEO Title</label>
          <input
            type="text"
            name="seo_title"
            value={formData.seo_title}
            onChange={handleInputChange}
            placeholder="SEO title"
          />
        </div>
        <div className="form-group">
          <label>SEO Description</label>
          <input
            type="text"
            name="seo_description"
            value={formData.seo_description}
            onChange={handleInputChange}
            placeholder="SEO description"
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="add-product-modal">
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="modal-header">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {renderStepIndicator()}

          <form>
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderMediaUpload()}
              {currentStep === 2 && renderBasicInfo()}
              {currentStep === 3 && renderInventoryDetails()}
            </AnimatePresence>

            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            <div className="form-actions">
              {currentStep > 1 && (
                <button type="button" className="secondary-btn" onClick={prevStep}>
                  Previous
                </button>
              )}

              {currentStep < 3 ? (
                <button type="button" className="primary-btn" onClick={nextStep}>
                  Next
                </button>
              ) : (
                <button type="button" className="primary-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? (editingProduct ? 'Updating...' : 'Creating...') : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddProductForm;
