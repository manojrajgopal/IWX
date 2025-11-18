// AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/adminAPI';
import websocketService from '../../services/websocket';
import './Dashboard.css';
import { ChangePassword } from '../../components/Profile/SecurityComponents'; // Adjust path as needed
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUser } from '../../redux/slices/authSlice';
import { authAPI } from '../../api/authAPI';
import AddProductForm from '../../components/AddProductForm';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const websocketConnectedRef = useRef(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ from: '', to: '' });
  // Product management states
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productFilters, setProductFilters] = useState({
    category: [],
    size: [],
    color: [],
    price: []
  });
  const [productPage, setProductPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [selectedSort, setSelectedSort] = useState('recommended');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Order management states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilters, setOrderFilters] = useState({
    status: [],
    payment_status: [],
    date_from: '',
    date_to: '',
    search: ''
  });
  const [orderPage, setOrderPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkOrderStatus, setBulkOrderStatus] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasOrderNext, setHasOrderNext] = useState(false);
  const [hasOrderPrev, setHasOrderPrev] = useState(false);
  const [selectedOrderSort, setSelectedOrderSort] = useState('created_at');
  const [isOrderFilterOpen, setIsOrderFilterOpen] = useState(false);
  const [isOrderSortOpen, setIsOrderSortOpen] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [orderStats, setOrderStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    processing_orders: 0,
    shipped_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0.0,
    average_order_value: 0.0,
    orders_today: 0,
    revenue_today: 0.0
  });
  const [totalOrderPages, setTotalOrderPages] = useState(1);

  // New order form data
  const [newOrderData, setNewOrderData] = useState({
    customer_email: '',
    customer_name: '',
    shipping_address: {
      first_name: '',
      last_name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India'
    },
    items: [{ product_id: '', quantity: 1, price: 0 }],
    shipping_method: 'standard',
    payment_method: 'card'
  });
  const [securityStats, setSecurityStats] = useState({
    total_login_attempts: 0,
    successful_logins: 0,
    failed_logins: 0,
    suspicious_activities: 0,
    active_sessions: 0,
    trusted_devices: 0
  });
  const [securityEvents, setSecurityEvents] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [securityTab, setSecurityTab] = useState('events');
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  const handleLogout = () => {
   dispatch(logout());
   };

  const handleSectionChange = async (sectionId) => {
    setActiveSection(sectionId);

    // Save the active section to user preferences
    const newPreferences = {
      ...user.preferences,
      last_active_section_admin: sectionId
    };

    try {
      const updatedUser = await authAPI.updateCurrentUser({ preferences: newPreferences });
      dispatch(updateUser(updatedUser));
    } catch (err) {
      console.error('Error updating admin active section preference:', err);
    }
  };

  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'customer',
    status: 'active'
  });
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenue: 0,
    visitors: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  const [performanceData, setPerformanceData] = useState({
    pageLoadTime: 0,
    bounceRate: 0,
    avgSession: 0
  });

  const [satisfactionData, setSatisfactionData] = useState({
    overall: 0,
    support: 0,
    product: 0,
    delivery: 0
  });

  const [inventoryAlerts, setInventoryAlerts] = useState([]);

  const [campaigns, setCampaigns] = useState([]);


  const [inventoryItems, setInventoryItems] = useState([]);

  const [marketingData, setMarketingData] = useState({
    roi: '...',
    clickRate: '...',
    impressions: '...',
    engagements: '...'
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    autoBackup: true,
    twoFactorAuth: true,
    darkMode: false
  });

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const [financeData, setFinanceData] = useState({
    revenue: '...',
    expenses: '...',
    profit: '...',
    growth: '...'
  });

  const [systemStatus, setSystemStatus] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);

  // Real-time data states
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);

  // Toggle functionality for settings
  const handleSettingChange = (settingKey) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
  };

  const handleStatusFilterChange = (status) => {
    setOrderStatusFilter(status);
    handleOrderFilterToggle('status', status);
  };

  const handlePaymentStatusFilterChange = (status) => {
    setPaymentStatusFilter(status);
    handleOrderFilterToggle('payment_status', status);
  };

  const handleDateRangeFilter = (from, to) => {
    setDateRangeFilter({ from, to });
    setOrderFilters(prev => ({
      ...prev,
      date_from: from,
      date_to: to
    }));
  };

  const clearAllOrderFilters = () => {
    setOrderStatusFilter('');
    setPaymentStatusFilter('');
    setDateRangeFilter({ from: '', to: '' });
    clearOrderFilters();
  };

  // Load dashboard data and set up real-time updates
  useEffect(() => {
    // Set active section from user preferences
    if (user?.preferences?.last_active_section_admin) {
      setActiveSection(user.preferences.last_active_section_admin);
    }

    loadDashboardData();
    loadUsersData();
    loadCustomersData();
    loadSecurityData();
    loadInventoryData();
    loadMarketingData();
    loadPerformanceData();
    loadCustomerSatisfactionData();
    loadCustomerStatsData();
    loadTrafficSourcesData();
    loadSystemStatusData();
    loadSalesData();
    loadTopProductsData();
    loadRecentOrdersData();
    loadRevenueTrendData();
  }, [user]); // Load data only once on mount

  // Load products data when section changes to products
  useEffect(() => {
    if (activeSection === 'products') {
      loadProductsData();
    }
  }, [activeSection, productFilters, selectedSort, productPage]);

  // Load orders data when section changes to orders
  useEffect(() => {
    if (activeSection === 'orders') {
      loadOrdersData();
      loadOrderStats();
    }
  }, [activeSection, orderFilters, selectedOrderSort, orderPage, orderSearchQuery]);

  // No polling - rely on WebSocket for real-time updates
  // If WebSocket fails, use the initial data loaded on mount

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    let checkConnectionInterval = null;
    const token = localStorage.getItem('token');

    // Only connect if we have a token and are not already connected
    if (token && !websocketService.isConnected('admin-dashboard')) {
      console.log('Initializing WebSocket connection for admin dashboard');

      const wsConnection = websocketService.connectAdminDashboard(
        (data) => {
          // Handle real-time updates
          console.log('WebSocket message received:', data);
          handleWebSocketMessage(data);
        },
        (error) => {
          console.error('WebSocket error:', error);
          websocketConnectedRef.current = false;
          setWebsocketConnected(false);
        },
        (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          websocketConnectedRef.current = false;
          setWebsocketConnected(false);
        }
      );

      // Set up connection status checking
      if (wsConnection) {
        checkConnectionInterval = setInterval(() => {
          const isConnected = websocketService.isConnected('admin-dashboard');
          if (isConnected !== websocketConnectedRef.current) {
            websocketConnectedRef.current = isConnected;
            setWebsocketConnected(isConnected);
          }
        }, 15000); // Check every 15 seconds

        // Initial connection status
        setTimeout(() => {
          const isConnected = websocketService.isConnected('admin-dashboard');
          websocketConnectedRef.current = isConnected;
          setWebsocketConnected(isConnected);
        }, 1000);
      }
    }

    return () => {
      if (checkConnectionInterval) {
        clearInterval(checkConnectionInterval);
      }
      // Clean up connection on unmount
      websocketService.disconnectAdminDashboard();
    };
  }, []); // Keep empty dependency array

  // WebSocket message handler
  const handleWebSocketMessage = (data) => {
    if (data.type === 'stats_update') {
      setStats(prev => ({ ...prev, ...data.data }));
    } else if (data.type === 'order_update') {
      if (activeSection === 'orders') {
        loadOrdersData();
        loadOrderStats();
      }
    } else if (data.type === 'auth_success') {
      console.log('WebSocket authentication successful');
      websocketConnectedRef.current = true;
      setWebsocketConnected(true);
    } else if (data.type === 'auth_failed') {
      console.error('WebSocket authentication failed');
      websocketConnectedRef.current = false;
      setWebsocketConnected(false);
    } else if (data.type === 'auth_required') {
      console.log('WebSocket authentication required');
    }
    // Add other message handlers as needed
  };


  const loadDashboardData = async () => {
    try {
      const dashboardStats = await adminAPI.getDashboardStats();
      setStats({
        totalSales: dashboardStats.orders.total_revenue,
        totalOrders: dashboardStats.orders.total_orders,
        totalCustomers: dashboardStats.users.total_users,
        totalProducts: dashboardStats.products.total_products,
        revenue: dashboardStats.revenue.total,
        visitors: 0, // Would come from analytics
        conversionRate: 0 // Would be calculated
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // If WebSocket is disconnected, show a more informative message
      if (!websocketConnected) {
        console.log('WebSocket disconnected, using REST API fallback');
      }
      // Don't show mock data on API failures - let the UI show loading states or empty states
    } finally {
      setLoading(false);
    }
  };

  const capitalizeName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const loadUsersData = async () => {
    try {
      const usersData = await adminAPI.getUsers();
      setUsers(usersData.map(user => ({
        id: user.id,
        name: `${capitalizeName(user.first_name || '')} ${capitalizeName(user.last_name || '')}`.trim() || user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role,
        email: user.email,
        lastActive: user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
        status: user.status,
        created_at: user.created_at
      })));
    } catch (error) {
      console.error('Failed to load users data:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadCustomersData = async () => {
    try {
      const customersData = await adminAPI.getUsers('customer'); // Filter by customer role
      setCustomers(customersData.map(customer => ({
        id: customer.id,
        name: `${capitalizeName(customer.first_name || '')} ${capitalizeName(customer.last_name || '')}`.trim() || customer.email,
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        role: customer.role || 'customer', // Ensure role is included
        email: customer.email,
        lastActive: customer.last_login ? new Date(customer.last_login).toLocaleString() : 'Never',
        status: customer.status,
        created_at: customer.created_at,
        totalOrders: 0, // Will be populated from order stats
        totalSpent: 0 // Will be populated from order stats
      })));
    } catch (error) {
      console.error('Failed to load customers data:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadSecurityData = async () => {
    try {
      setLoadingSecurity(true);
      const [stats, events, history, devices] = await Promise.all([
        adminAPI.getSecurityStats(),
        adminAPI.getSecurityEvents(null, null, 50),
        adminAPI.getLoginHistory(null, 50),
        adminAPI.getConnectedDevices()
      ]);

      setSecurityStats(stats);
      setSecurityEvents(events);
      setLoginHistory(history);
      setConnectedDevices(devices);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoadingSecurity(false);
    }
  };

  const loadInventoryData = async () => {
    try {
      const [alerts, items] = await Promise.all([
        adminAPI.getInventoryAlerts(),
        adminAPI.getInventoryItems()
      ]);
      setInventoryAlerts(alerts);
      setInventoryItems(items);
    } catch (error) {
      console.error('Failed to load inventory data:', error);
    }
  };

  const loadMarketingData = async () => {
    try {
      const [campaigns, stats] = await Promise.all([
        adminAPI.getMarketingCampaigns(),
        adminAPI.getMarketingStats()
      ]);
      setCampaigns(campaigns);
      setMarketingData(stats);
    } catch (error) {
      console.error('Failed to load marketing data:', error);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const metrics = await adminAPI.getPerformanceMetrics();
      setPerformanceData(metrics);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    }
  };

  const loadCustomerSatisfactionData = async () => {
    try {
      const satisfaction = await adminAPI.getCustomerSatisfaction();
      setSatisfactionData(satisfaction);
    } catch (error) {
      console.error('Failed to load customer satisfaction data:', error);
    }
  };

  const loadCustomerStatsData = async () => {
    try {
      const customerStats = await adminAPI.getCustomerStats();
      // Update customers with real stats
      setCustomers(prev => prev.map(customer => {
        const stats = customerStats.find(stat => stat.id === customer.id);
        if (stats) {
          return {
            ...customer,
            totalOrders: stats.total_orders,
            totalSpent: stats.total_spent
          };
        }
        return customer;
      }));
    } catch (error) {
      console.error('Failed to load customer stats data:', error);
    }
  };

  const loadTrafficSourcesData = async () => {
    try {
      const traffic = await adminAPI.getTrafficSources();
      setTrafficSources(traffic);
    } catch (error) {
      console.error('Failed to load traffic sources data:', error);
    }
  };

  const loadSystemStatusData = async () => {
    try {
      const status = await adminAPI.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to load system status data:', error);
    }
  };

  const loadSalesData = async () => {
    try {
      const data = await adminAPI.getSalesData();
      setSalesData(data);
    } catch (error) {
      console.error('Failed to load sales data:', error);
    }
  };

  const loadTopProductsData = async () => {
    try {
      const data = await adminAPI.getTopProducts();
      setTopProducts(data);
    } catch (error) {
      console.error('Failed to load top products data:', error);
    }
  };

  const loadRecentOrdersData = async () => {
    try {
      const data = await adminAPI.getRecentOrders();
      setRecentOrders(data);
    } catch (error) {
      console.error('Failed to load recent orders data:', error);
    }
  };

  const loadRevenueTrendData = async () => {
    try {
      const data = await adminAPI.getRevenueTrend();
      setRevenueTrend(data);
    } catch (error) {
      console.error('Failed to load revenue trend data:', error);
    }
  };

  const loadProductsData = async () => {
    try {
      setLoadingProducts(true);
      const filters = {
        category: productFilters.category.length > 0 ? productFilters.category : undefined,
        sizes: productFilters.size.length > 0 ? productFilters.size : undefined,
        colors: productFilters.color.length > 0 ? productFilters.color : undefined,
        min_price: productFilters.price.includes('under50') ? 0 :
                  productFilters.price.includes('50to100') ? 50 :
                  productFilters.price.includes('100to150') ? 100 : undefined,
        max_price: productFilters.price.includes('under50') ? 50 :
                  productFilters.price.includes('50to100') ? 100 :
                  productFilters.price.includes('100to150') ? 150 :
                  productFilters.price.includes('over150') ? undefined : undefined,
        skip: (productPage - 1) * 12,
        limit: 12,
        sort_by: selectedSort === 'recommended' ? 'created_at' :
                selectedSort === 'priceLowHigh' ? 'price' :
                selectedSort === 'priceHighLow' ? 'price' :
                selectedSort === 'newest' ? 'created_at' :
                selectedSort === 'rating' ? 'rating' : 'created_at',
        sort_order: selectedSort === 'priceHighLow' ? '1' : '-1'
      };

      const response = await adminAPI.getProducts(filters);
      setProducts(response.products || []);
      setTotalProducts(response.total || 0);
      setHasNext(response.has_next || false);
      setHasPrev(response.has_prev || false);
    } catch (error) {
      console.error('Failed to load products data:', error);
      // Handle 529 status code specifically
      if (error.response?.status === 529) {
        console.log('Server overloaded, retrying in 2 seconds...');
        setTimeout(() => loadProductsData(), 2000);
      } else {
        // Show user-friendly error message for other errors
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrderStats = async () => {
    try {
      const stats = await adminAPI.getOrderStats();
      setOrderStats(stats);
    } catch (error) {
      console.error('Failed to load order stats:', error);
    }
  };

  const loadOrdersData = async () => {
    try {
      setLoadingOrders(true);
      const filters = {
        status: orderFilters.status.length > 0 ? orderFilters.status : undefined,
        payment_status: orderFilters.payment_status.length > 0 ? orderFilters.payment_status : undefined,
        date_from: orderFilters.date_from || undefined,
        date_to: orderFilters.date_to || undefined,
        search: orderSearchQuery || undefined,
        skip: (orderPage - 1) * 20,
        limit: 20,
        sort_by: selectedOrderSort,
        sort_order: '-1'
      };

      const response = await adminAPI.getOrders(filters);
      setOrders(response.orders || []);
      setTotalOrders(response.total || 0);
      setTotalOrderPages(Math.ceil((response.total || 0) / 20));
      setHasOrderNext(response.has_next || false);
      setHasOrderPrev(response.has_prev || false);
    } catch (error) {
      console.error('Failed to load orders data:', error);
      if (error.response?.status === 529) {
        console.log('Server overloaded, retrying in 2 seconds...');
        setTimeout(() => loadOrdersData(), 2000);
      }
    } finally {
      setLoadingOrders(false);
    }
  };


  const handleFilterToggle = (filterType, value) => {
    setProductFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setProductFilters({
      category: [],
      size: [],
      color: [],
      price: []
    });
    setSelectedSort('recommended');
  };

  const paginate = (pageNumber) => setProductPage(pageNumber);

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsAddProductOpen(true);
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await adminAPI.updateProductStatus(productId, newStatus);
      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Failed to update product status:', error);
      if (error.response?.status === 529) {
        console.log('Server overloaded, retrying status update in 2 seconds...');
        setTimeout(() => handleStatusChange(productId, newStatus), 2000);
      } else {
        alert(`Failed to update product status: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await adminAPI.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        setSelectedProducts(prev => prev.filter(id => id !== productId));
      } catch (error) {
        console.error('Failed to delete product:', error);
        if (error.response?.status === 529) {
          console.log('Server overloaded, retrying delete in 2 seconds...');
          setTimeout(() => handleDeleteProduct(productId), 2000);
        } else {
          alert(`Failed to delete product: ${error.response?.data?.detail || error.message}`);
        }
      }
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedProducts.length === 0) return;

    try {
      await adminAPI.bulkUpdateProductStatus(selectedProducts, bulkStatus);
      // Update local state
      setProducts(prev => prev.map(p =>
        selectedProducts.includes(p.id) ? { ...p, status: bulkStatus } : p
      ));
      setSelectedProducts([]);
      setBulkStatus('');
      alert(`Successfully updated ${selectedProducts.length} products`);
    } catch (error) {
      console.error('Failed to bulk update products:', error);
      if (error.response?.status === 529) {
        console.log('Server overloaded, retrying bulk update in 2 seconds...');
        setTimeout(() => handleBulkStatusUpdate(), 2000);
      } else {
        alert(`Failed to update products: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  // Order management handlers
  const handleOrderFilterToggle = (filterType, value) => {
    setOrderFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      return newFilters;
    });
  };

  const clearOrderFilters = () => {
    setOrderFilters({
      status: [],
      payment_status: [],
      date_from: '',
      date_to: ''
    });
    setOrderSearchQuery('');
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert(`Failed to update order status: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleBulkOrderUpdate = async () => {
    if (!bulkOrderStatus || selectedOrders.length === 0) return;

    try {
      await adminAPI.bulkUpdateOrderStatus(selectedOrders, bulkOrderStatus);
      // Update local state
      setOrders(prev => prev.map(o =>
        selectedOrders.includes(o.id) ? { ...o, status: bulkOrderStatus } : o
      ));
      setSelectedOrders([]);
      setBulkOrderStatus('');
      alert(`Successfully updated ${selectedOrders.length} orders`);
    } catch (error) {
      console.error('Failed to bulk update orders:', error);
      alert(`Failed to update orders: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const handleEditOrder = (order) => {
    // For now, just show details - could implement full edit later
    handleViewOrderDetails(order);
  };

  const handleExportOrders = async () => {
    try {
      const filters = {
        status: orderFilters.status.length > 0 ? orderFilters.status : undefined,
        payment_status: orderFilters.payment_status.length > 0 ? orderFilters.payment_status : undefined,
        date_from: orderFilters.date_from || undefined,
        date_to: orderFilters.date_to || undefined,
        search: orderSearchQuery || undefined,
        format: 'csv'
      };

      const blob = await adminAPI.exportOrders(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export orders:', error);
      alert('Failed to export orders');
    }
  };

  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order ${order.order_number}</h1>
            <p><strong>Customer:</strong> ${order.user ? `${order.user.first_name} ${order.user.last_name}` : 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <div class="section">
            <h3>Shipping Address</h3>
            <p>
              ${order.shipping_address.first_name} ${order.shipping_address.last_name}<br/>
              ${order.shipping_address.address_line_1}<br/>
              ${order.shipping_address.address_line_2 ? order.shipping_address.address_line_2 + '<br/>' : ''}
              ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}<br/>
              ${order.shipping_address.country}
            </p>
          </div>

          <div class="section">
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.product ? item.product.name : 'Product'}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toLocaleString()}</td>
                    <td>₹${item.subtotal.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div style="text-align: right;">
              <p><strong>Subtotal:</strong> ₹${order.subtotal.toLocaleString()}</p>
              <p><strong>Tax:</strong> ₹${order.tax_amount.toLocaleString()}</p>
              <p><strong>Shipping:</strong> ₹${order.shipping_cost.toLocaleString()}</p>
              <p class="total"><strong>Total:</strong> ₹${order.total_amount.toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSendOrderEmail = async (order) => {
    // This would integrate with email service
    alert('Email functionality would be implemented here');
  };

  // New order form handlers
  const addNewOrderItem = () => {
    setNewOrderData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, price: 0 }]
    }));
  };

  const removeNewOrderItem = (index) => {
    setNewOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleNewOrderItemChange = (index, field, value) => {
    setNewOrderData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleCreateNewOrder = async () => {
    try {
      // This would need to be implemented in the backend
      alert('New order creation would be implemented here');
      setShowNewOrderModal(false);
      // Reset form
      setNewOrderData({
        customer_email: '',
        customer_name: '',
        shipping_address: {
          first_name: '',
          last_name: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'India'
        },
        items: [{ product_id: '', quantity: 1, price: 0 }],
        shipping_method: 'standard',
        payment_method: 'card'
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    }
  };

  const handleRunSecurityScan = async () => {
    try {
      setLoadingSecurity(true);
      const result = await adminAPI.runSecurityScan();
      alert(`Security scan completed!\n\n${JSON.stringify(result.results, null, 2)}`);
      // Reload security data after scan
      await loadSecurityData();
    } catch (error) {
      console.error('Failed to run security scan:', error);
      alert(`Failed to run security scan: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoadingSecurity(false);
    }
  };

  const handleUserUpdate = (data) => {
    if (data.action === 'create') {
      const newUser = {
        id: data.user.id,
        first_name: data.user.first_name || '',
        last_name: data.user.last_name || '',
        role: data.user.role,
        email: data.user.email,
        lastActive: data.user.last_login ? new Date(data.user.last_login).toLocaleString() : 'Never',
        status: data.user.status,
        created_at: data.user.created_at,
        name: `${capitalizeName(data.user.first_name || '')} ${capitalizeName(data.user.last_name || '')}`.trim() || data.user.email
      };
      setUsers(prev => [newUser, ...prev]);

      // If the new user is a customer, add to customers list
      if (data.user.role === 'customer') {
        const newCustomer = {
          id: data.user.id,
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          role: data.user.role,
          email: data.user.email,
          lastActive: data.user.last_login ? new Date(data.user.last_login).toLocaleString() : 'Never',
          status: data.user.status,
          created_at: data.user.created_at,
          name: `${capitalizeName(data.user.first_name || '')} ${capitalizeName(data.user.last_name || '')}`.trim() || data.user.email,
          totalOrders: 0,
          totalSpent: 0
        };
        setCustomers(prev => [newCustomer, ...prev]);
      }
    } else if (data.action === 'update') {
      setUsers(prev => prev.map(user =>
        user.id === data.user.id ? {
          ...user,
          first_name: data.user.first_name || user.first_name,
          last_name: data.user.last_name || user.last_name,
          role: data.user.role || user.role,
          email: data.user.email || user.email,
          lastActive: data.user.last_login ? new Date(data.user.last_login).toLocaleString() : user.lastActive,
          status: data.user.status || user.status,
          name: `${capitalizeName(data.user.first_name || user.first_name)} ${capitalizeName(data.user.last_name || user.last_name)}`.trim() || (data.user.email || user.email)
        } : user
      ));

      // Update customers list if the user is a customer
      setCustomers(prev => prev.map(customer =>
        customer.id === data.user.id ? {
          ...customer,
          first_name: data.user.first_name || customer.first_name,
          last_name: data.user.last_name || customer.last_name,
          role: data.user.role || customer.role,
          email: data.user.email || customer.email,
          lastActive: data.user.last_login ? new Date(data.user.last_login).toLocaleString() : customer.lastActive,
          status: data.user.status || customer.status,
          name: `${capitalizeName(data.user.first_name || customer.first_name)} ${capitalizeName(data.user.last_name || customer.last_name)}`.trim() || (data.user.email || customer.email)
        } : customer
      ));

      // If role changed from customer to something else, remove from customers
      if (data.user.role !== 'customer') {
        setCustomers(prev => prev.filter(customer => customer.id !== data.user.id));
      } else {
        // Update customers list if the user is now a customer
        setCustomers(prev => prev.map(customer =>
          customer.id === data.user.id ? {
            ...customer,
            first_name: data.user.first_name || customer.first_name,
            last_name: data.user.last_name || customer.last_name,
            role: data.user.role || customer.role,
            email: data.user.email || customer.email,
            lastActive: data.user.last_login ? new Date(data.user.last_login).toLocaleString() : customer.lastActive,
            status: data.user.status || customer.status,
            name: `${capitalizeName(data.user.first_name || customer.first_name)} ${capitalizeName(data.user.last_name || customer.last_name)}`.trim() || (data.user.email || customer.email)
          } : customer
        ));
      }
    } else if (data.action === 'delete') {
      setUsers(prev => prev.filter(user => user.id !== data.user_id));
      setCustomers(prev => prev.filter(customer => customer.id !== data.user_id));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || 'customer',
      status: user.status || 'active'
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        setCustomers(prev => prev.filter(customer => customer.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert(`Failed to delete user: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      // Trim email to remove any spaces
      const cleanedUserData = {
        ...userData,
        email: userData.email.trim()
      };

      console.log('Saving user with data:', cleanedUserData); // Debug log
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, cleanedUserData);
        setUsers(prev => prev.map(user =>
          user.id === editingUser.id ? {
            ...user,
            ...cleanedUserData,
            name: `${capitalizeName(cleanedUserData.first_name || user.first_name)} ${capitalizeName(cleanedUserData.last_name || user.last_name)}`.trim() || cleanedUserData.email
          } : user
        ));

        // Update customers list if editing a customer
        if (cleanedUserData.role === 'customer') {
          setCustomers(prev => prev.map(customer =>
            customer.id === editingUser.id ? {
              ...customer,
              ...cleanedUserData,
              name: `${capitalizeName(cleanedUserData.first_name || customer.first_name)} ${capitalizeName(cleanedUserData.last_name || customer.last_name)}`.trim() || cleanedUserData.email
            } : customer
          ));
        } else {
          // Remove from customers if role changed from customer
          setCustomers(prev => prev.filter(customer => customer.id !== editingUser.id));
        }
      } else {
        const newUser = await adminAPI.createUser(cleanedUserData);
        console.log('Created user response:', newUser); // Debug log
        const formattedUser = {
          ...newUser,
          name: `${capitalizeName(newUser.first_name || '')} ${capitalizeName(newUser.last_name || '')}`.trim() || newUser.email
        };
        setUsers(prev => [formattedUser, ...prev]);

        // Add to customers list if role is customer
        if (newUser.role === 'customer') {
          const formattedCustomer = {
            ...newUser,
            name: `${capitalizeName(newUser.first_name || '')} ${capitalizeName(newUser.last_name || '')}`.trim() || newUser.email,
            totalOrders: 0,
            totalSpent: 0
          };
          setCustomers(prev => [formattedCustomer, ...prev]);
        }
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserFormData({
        first_name: '',
        last_name: '',
        email: '',
        role: 'customer',
        status: 'active'
      });
      setCustomers(prev => [newCustomer, ...prev]);
    } catch (error) {
      console.error('Failed to save user:', error);
      alert(`Failed to save user: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Drag functionality
  const handleMouseDown = (e) => {
    if (!sidebarOpen) return;
    setIsDragging(true);
    const startX = e.clientX - dragOffset;
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newOffset = e.clientX - startX;
      // Limit drag range to -50px to +50px
      const clampedOffset = Math.max(-50, Math.min(50, newOffset));
      setDragOffset(clampedOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Reset to center after drag ends
      setDragOffset(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  };

  // Use real data from state instead of mock data

  // Filter options
  const filterOptions = {
    category: [
      { label: 'Woman', value: 'woman' },
      { label: 'Man', value: 'man' },
      { label: 'Kids', value: 'kids' },
      { label: 'Accessories', value: 'accessories' }
    ],
    size: [
      { label: 'XS', value: 'xs' },
      { label: 'S', value: 's' },
      { label: 'M', value: 'm' },
      { label: 'L', value: 'l' },
      { label: 'XL', value: 'xl' }
    ],
    color: [
      { label: 'Black', value: 'black' },
      { label: 'White', value: 'white' },
      { label: 'Navy', value: 'navy' },
      { label: 'Beige', value: 'beige' },
      { label: 'Green', value: 'green' },
      { label: 'Red', value: 'red' }
    ],
    price: [
      { label: 'Under $50', value: 'under50' },
      { label: '$50 - $100', value: '50to100' },
      { label: '$100 - $150', value: '100to150' },
      { label: 'Over $150', value: 'over150' }
    ]
  };

  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Price: Low to High', value: 'priceLowHigh' },
    { label: 'Price: High to Low', value: 'priceHighLow' },
    { label: 'Newest', value: 'newest' },
    { label: 'Rating', value: 'rating' }
  ];

  const orderSortOptions = [
    { label: 'Newest First', value: 'created_at' },
    { label: 'Oldest First', value: 'created_at_asc' },
    { label: 'Total: High to Low', value: 'total_amount' },
    { label: 'Total: Low to High', value: 'total_amount_asc' },
    { label: 'Status', value: 'status' }
  ];

  const orderStatusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Refunded', value: 'refunded' }
  ];

  const paymentStatusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' }
  ];

  const totalPages = Math.ceil(totalProducts / 12);

  // Render star ratings
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? "star filled" : "star"}>★</span>
    ));
  };

  // Function to render animated value
  const AnimatedValue = ({ value, prefix = '', suffix = '' }) => {
    return (
      <motion.span
        key={value}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}{value.toLocaleString()}{suffix}
      </motion.span>
    );
  };

  const LineChart = ({ data, width = '100%', height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    
    const getX = (index) => (index / (data.length - 1)) * 100;
    const getY = (value) => 100 - ((value - minValue) / (maxValue - minValue)) * 100;

    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
    const areaPoints = `0,100 ${points} 100,100`;

    return (
        <svg width={width} height={height} viewBox="0 0 100 100" className="line-chart-container">
        <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2196f3" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2196f3" stopOpacity="0" />
            </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
            <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            className="line-chart-grid"
            />
        ))}
        
        {/* Area */}
        <polygon points={areaPoints} className="line-chart-area" />
        
        {/* Line */}
        <polyline points={points} className="line-chart-path" />
        
        {/* Dots */}
        {data.map((d, i) => (
            <motion.circle
            key={i}
            cx={getX(i)}
            cy={getY(d.value)}
            className="line-chart-dot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            />
        ))}
        </svg>
    );
  };

  const CalendarWidget = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const events = []; // Will be populated from real data

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <h4>January 2025</h4>
        <button className="primary-btn" style={{ padding: '5px 10px', fontSize: '12px' }}>
          View All
        </button>
      </div>
      <div className="calendar-grid">
        {days.map(day => (
          <div key={day} className="calendar-day header">{day}</div>
        ))}
        {dates.map(date => (
          <div
            key={date}
            className={`calendar-day ${
              events.includes(date) ? 'event' : ''
            } ${date === 15 ? 'today' : ''}`}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
};

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1 onClick={() => window.location.href = '/'} style={{cursor: 'pointer'}}>IWX Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="admin-search">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button>🔍</button>
          </div>
          <div className="admin-notifications">
            <button className="notification-btn">🔔</button>
            <span className="notification-count">3</span>
          </div>
          <div className="websocket-status">
            <div className={`status-indicator ${websocketConnected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              <span>{websocketConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          <div className="admin-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <div className="profile-avatar">
              {user?.first_name && user?.last_name
                ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span>
              {user?.first_name && user?.last_name
                ? `${capitalizeName(user.first_name)} ${capitalizeName(user.last_name)}`
                : user?.email || 'Admin User'}
            </span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          transform: sidebarOpen ? `translateX(${dragOffset}px)` : 'translateX(-100%)',
          transition: isDragging ? 'none' : 'transform var(--transition-normal)',
          cursor: sidebarOpen ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Desktop Navigation - Visible on large screens */}
        <nav className="desktop-nav">
          <button
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleSectionChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => handleSectionChange('products')}
          >
            🛍️ Products
          </button>
          <button
            className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => handleSectionChange('orders')}
          >
            📦 Orders
          </button>
          <button
            className={`nav-item ${activeSection === 'customers' ? 'active' : ''}`}
            onClick={() => handleSectionChange('customers')}
          >
            👥 Customers
          </button>
          <button
            className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => handleSectionChange('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={`nav-item ${activeSection === 'marketing' ? 'active' : ''}`}
            onClick={() => handleSectionChange('marketing')}
          >
            🎯 Marketing
          </button>
          <button
            className={`nav-item ${activeSection === 'inventory' ? 'active' : ''}`}
            onClick={() => handleSectionChange('inventory')}
          >
            📋 Inventory
          </button>
          <button
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => handleSectionChange('users')}
          >
            👥 User Management
          </button>
          <button
            className={`nav-item ${activeSection === 'finance' ? 'active' : ''}`}
            onClick={() => handleSectionChange('finance')}
          >
            💰 Finance
          </button>
          <button
            className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => handleSectionChange('reports')}
          >
            📋 Reports
          </button>
          <button
            className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => handleSectionChange('notifications')}
          >
            🔔 Notifications
          </button>
          <button
            className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => handleSectionChange('security')}
          >
            🔒 Security
          </button>
          <button
            className={`nav-item ${activeSection === 'integrations' ? 'active' : ''}`}
            onClick={() => handleSectionChange('integrations')}
          >
            🔗 Integrations
          </button>
          <button
            className={`nav-item ${activeSection === 'backups' ? 'active' : ''}`}
            onClick={() => handleSectionChange('backups')}
          >
            💾 Backups
          </button>
          <button
            className={`nav-item ${activeSection === 'logs' ? 'active' : ''}`}
            onClick={() => handleSectionChange('logs')}
          >
            📝 Logs
          </button>
          <button
            className={`nav-item ${activeSection === 'help' ? 'active' : ''}`}
            onClick={() => handleSectionChange('help')}
          >
            ❓ Help & Support
          </button>
          <button
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => handleSectionChange('settings')}
          >
            ⚙️ Settings
          </button>
        {/* Logout Button */}
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
        </nav>

        {/* Mobile Navigation - Only in sidebar */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('dashboard');
              setSidebarOpen(false);
            }}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('products');
              setSidebarOpen(false);
            }}
          >
            🛍️ Products
          </button>
          <button
            className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('orders');
              setSidebarOpen(false);
            }}
          >
            📦 Orders
          </button>
          <button
            className={`nav-item ${activeSection === 'customers' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('customers');
              setSidebarOpen(false);
            }}
          >
            👥 Customers
          </button>
          <button
            className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('analytics');
              setSidebarOpen(false);
            }}
          >
            📈 Analytics
          </button>
          <button
            className={`nav-item ${activeSection === 'marketing' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('marketing');
              setSidebarOpen(false);
            }}
          >
            🎯 Marketing
          </button>
          <button
            className={`nav-item ${activeSection === 'inventory' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('inventory');
              setSidebarOpen(false);
            }}
          >
            📋 Inventory
          </button>
          <button
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('users');
              setSidebarOpen(false);
            }}
          >
            👥 User Management
          </button>
          <button
            className={`nav-item ${activeSection === 'finance' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('finance');
              setSidebarOpen(false);
            }}
          >
            💰 Finance
          </button>
          <button
            className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('reports');
              setSidebarOpen(false);
            }}
          >
            📋 Reports
          </button>
          <button
            className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('notifications');
              setSidebarOpen(false);
            }}
          >
            🔔 Notifications
          </button>
          <button
            className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('security');
              setSidebarOpen(false);
            }}
          >
            🔒 Security
          </button>
          <button
            className={`nav-item ${activeSection === 'integrations' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('integrations');
              setSidebarOpen(false);
            }}
          >
            🔗 Integrations
          </button>
          <button
            className={`nav-item ${activeSection === 'backups' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('backups');
              setSidebarOpen(false);
            }}
          >
            💾 Backups
          </button>
          <button
            className={`nav-item ${activeSection === 'logs' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('logs');
              setSidebarOpen(false);
            }}
          >
            📝 Logs
          </button>
          <button
            className={`nav-item ${activeSection === 'help' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('help');
              setSidebarOpen(false);
            }}
          >
            ❓ Help & Support
          </button>
          <button
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => {
              handleSectionChange('settings');
              setSidebarOpen(false);
            }}
          >
            ⚙️ Settings
          </button>
          {/* Logout Button */}
          <button
            className="logout-btn"
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Dashboard Section */}
        <AnimatePresence mode="wait">
          {activeSection === 'dashboard' && (
            <motion.section 
              className="dashboard-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="section-header">
                <h2>Dashboard Overview</h2>
                <div className="date-filter">
                  <select>
                    <option>Today</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Year</option>
                    <option>Custom Range</option>
                  </select>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">💰</div>
                  <div className="metric-content">
                    <h3>Total Revenue</h3>
                    <p className="metric-value">
                      ₹{loading ? '...' : <AnimatedValue value={stats.totalSales + stats.revenue} />}
                    </p>
                    <div className="metric-trend up">
                      <span>↑ 12.5%</span> from last month
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">📦</div>
                  <div className="metric-content">
                    <h3>Total Orders</h3>
                    <p className="metric-value">
                      {loading ? '...' : <AnimatedValue value={stats.totalOrders} />}
                    </p>
                    <div className="metric-trend up">
                      <span>↑ 8.3%</span> from last month
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">👥</div>
                  <div className="metric-content">
                    <h3>Total Customers</h3>
                    <p className="metric-value">
                      {loading ? '...' : <AnimatedValue value={stats.totalCustomers} />}
                    </p>
                    <div className="metric-trend up">
                      <span>↑ 5.7%</span> from last month
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-content">
                    <h3>Conversion Rate</h3>
                    <p className="metric-value">
                      {loading ? '...' : <AnimatedValue value={(3.2 + stats.conversionRate).toFixed(1)} suffix="%" />}
                    </p>
                    <div className="metric-trend down">
                      <span>↓ 0.3%</span> from last month
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                <div className="chart-card">
                  <h3>Sales Overview</h3>
                  <div className="chart-container">
                    {salesData.length > 0 ? salesData.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <motion.div
                          className="chart-bar"
                          initial={{ height: 0 }}
                          animate={{ height: `${(item.sales / 35000) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        >
                          <div className="bar-value">₹{(item.sales / 1000).toFixed(0)}k</div>
                        </motion.div>
                        <span className="bar-label">{item.month}</span>
                      </div>
                    )) : (
                      <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Loading sales data...</div>
                    )}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Revenue vs Orders</h3>
                  <div className="dual-chart-container">
                    {salesData.length > 0 ? salesData.map((item, index) => (
                      <div key={index} className="dual-chart-bar-container">
                        <div className="dual-bars">
                          <motion.div
                            className="revenue-bar"
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.sales / 35000) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          ></motion.div>
                          <motion.div
                            className="orders-bar"
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.orders / 600) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                          ></motion.div>
                        </div>
                        <span className="bar-label">{item.month}</span>
                      </div>
                    )) : (
                      <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Loading chart data...</div>
                    )}
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <span className="legend-color revenue"></span>
                      Revenue
                    </div>
                    <div className="legend-item">
                      <span className="legend-color orders"></span>
                      Orders
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Top Products */}
              <div className="activity-row">
                <div className="activity-card">
                  <h3>Recent Orders</h3>
                  <div className="activity-list">
                    {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-info">
                          <strong>#{order.id}</strong>
                          <span>{order.customer}</span>
                        </div>
                        <div className="activity-details">
                          <span>₹{order.amount}</span>
                          <span className={`status ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Loading recent orders...</div>
                    )}
                  </div>
                  <button className="view-all-btn">View All Orders</button>
                </div>

                <div className="activity-card">
                  <h3>Top Products</h3>
                  <div className="products-list">
                    {topProducts.length > 0 ? topProducts.map((product, index) => (
                      <div key={index} className="product-item">
                        <div className="product-rank">{index + 1}</div>
                        <div className="product-info">
                          <strong>{product.name}</strong>
                          <span>{product.sales} sales</span>
                        </div>
                        <div className="product-revenue">
                          ₹{product.revenue.toLocaleString()}
                        </div>
                      </div>
                    )) : (
                      <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Loading top products...</div>
                    )}
                  </div>
                  <button className="view-all-btn">View All Products</button>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="traffic-card">
                <h3>Traffic Sources</h3>
                <div className="traffic-sources">
                  {trafficSources.length > 0 ? trafficSources.map((source, index) => (
                    <div key={index} className="traffic-item">
                      <div className="traffic-source">
                        <span>{source.source}</span>
                        <span>{source.visitors.toLocaleString()} visitors</span>
                      </div>
                      <div className="traffic-bar-container">
                        <motion.div
                          className="traffic-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${source.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        ></motion.div>
                      </div>
                      <span className="traffic-percentage">{source.percentage}%</span>
                    </div>
                  )) : (
                    <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Loading traffic data...</div>
                  )}
                </div>
              </div>

            {/* Quick Stats */}
            <div className="quick-stats-grid">
            <div className="quick-stat-card" style={{borderLeftColor: '#4caf50'}}>
                <div className="quick-stat-value">{performanceData.pageLoadTime > 0 ? `${performanceData.pageLoadTime}s` : '...'}</div>
                <div className="quick-stat-label">Page Load Time</div>
            </div>
            <div className="quick-stat-card" style={{borderLeftColor: '#2196f3'}}>
                <div className="quick-stat-value">{performanceData.avgSession > 0 ? `${performanceData.avgSession}m` : '...'}</div>
                <div className="quick-stat-label">Avg. Session</div>
            </div>
            <div className="quick-stat-card" style={{borderLeftColor: '#ff9800'}}>
                <div className="quick-stat-value">{performanceData.bounceRate > 0 ? `${performanceData.bounceRate}%` : '...'}</div>
                <div className="quick-stat-label">Bounce Rate</div>
            </div>
            <div className="quick-stat-card" style={{borderLeftColor: '#9c27b0'}}>
                <div className="quick-stat-value">{satisfactionData.overall > 0 ? satisfactionData.overall : '...'}</div>
                <div className="quick-stat-label">Satisfaction</div>
            </div>
            </div>

            {/* Revenue Trend Line Chart */}
            <div className="chart-card">
            <h3>Revenue Trend (14 Days)</h3>
            <LineChart data={revenueTrend.length > 0 ? revenueTrend : []} />
            </div>

            {/* Performance Metrics */}
            <div className="performance-metrics">
            <div className="performance-card">
                <h4>Page Load Time</h4>
                <div className="metric-value">{performanceData.pageLoadTime > 0 ? `${performanceData.pageLoadTime}s` : '...'}</div>
                <div className="progress-bar">
                <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: performanceData.pageLoadTime > 0 ? `${(performanceData.pageLoadTime / 5) * 100}%` : '0%' }}
                    transition={{ duration: 1 }}
                ></motion.div>
                </div>
                <span>Target: {'<'}3s</span>
            </div>

            <div className="performance-card">
                <h4>Bounce Rate</h4>
                <div className="metric-value">{performanceData.bounceRate > 0 ? `${performanceData.bounceRate}%` : '...'}</div>
                <div className="progress-bar">
                <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: performanceData.bounceRate > 0 ? `${performanceData.bounceRate}%` : '0%' }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{background: performanceData.bounceRate > 50 ? '#f44336' : '#4caf50'}}
                ></motion.div>
                </div>
                <span>Industry avg: 45%</span>
            </div>

            <div className="performance-card">
                <h4>Avg. Session Duration</h4>
                <div className="metric-value">{performanceData.avgSession > 0 ? `${performanceData.avgSession}m` : '...'}</div>
                <div className="progress-bar">
                <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: performanceData.avgSession > 0 ? `${(performanceData.avgSession / 15) * 100}%` : '0%' }}
                    transition={{ duration: 1, delay: 0.4 }}
                ></motion.div>
                </div>
                <span>Goal: 10m</span>
            </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="satisfaction-metrics">
            <div className="satisfaction-card">
                <h4>Overall Satisfaction</h4>
                <div className="satisfaction-score">{satisfactionData.overall > 0 ? `${satisfactionData.overall}/5` : '...'}</div>
                <div className="satisfaction-stars">★★★★★</div>
                <p>Based on customer feedback</p>
            </div>

            <div className="satisfaction-card">
                <h4>Support Rating</h4>
                <div className="satisfaction-score" style={{color: '#2196f3'}}>{satisfactionData.support > 0 ? `${satisfactionData.support}/5` : '...'}</div>
                <div className="satisfaction-stars">★★★★★</div>
                <p>Customer support feedback</p>
            </div>

            <div className="satisfaction-card">
                <h4>Product Quality</h4>
                <div className="satisfaction-score" style={{color: '#4caf50'}}>{satisfactionData.product > 0 ? `${satisfactionData.product}/5` : '...'}</div>
                <div className="satisfaction-stars">★★★★☆</div>
                <p>Product satisfaction rate</p>
            </div>
            </div>

            {/* Inventory Alerts */}
            <div className="inventory-alerts">
            <h3>Inventory Alerts</h3>
            <div className="alert-list">
                {inventoryAlerts.map((alert, index) => (
                <motion.div 
                    key={index}
                    className={`alert-item ${alert.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <div className="alert-icon">
                    {alert.type === 'low' ? '⚠️' : alert.type === 'warning' ? '🔔' : 'ℹ️'}
                    </div>
                    <div style={{flex: 1}}>
                    <strong>{alert.product}</strong>
                    <div>Stock: {alert.stock} units (Threshold: {alert.threshold})</div>
                    </div>
                    <button className="primary-btn" style={{padding: '5px 10px', fontSize: '12px'}}>
                    Restock
                    </button>
                </motion.div>
                ))}
            </div>
            </div>

            {/* Marketing Campaigns */}
            <div className="campaigns-grid">
            <h3 style={{gridColumn: '1 / -1', marginBottom: '0'}}>Marketing Campaigns</h3>
            {campaigns.length > 0 ? campaigns.map((campaign, index) => (
                <div key={index} className="campaign-card">
                <h4>{campaign.name}</h4>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <span>Progress</span>
                    <span>{campaign.progress}%</span>
                </div>
                <div className="campaign-progress">
                    <motion.div
                    className="campaign-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${campaign.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    style={{
                        background: campaign.status === 'completed' ? '#4caf50' :
                                campaign.progress > 75 ? '#ff9800' : '#2196f3'
                    }}
                    ></motion.div>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666'}}>
                    <span>₹{campaign.spent.toLocaleString()}</span>
                    <span>₹{campaign.budget.toLocaleString()}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
                    <span>Spent</span>
                    <span>Budget</span>
                </div>
                </div>
            )) : (
              <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666'}}>Loading campaigns...</div>
            )}
            </div>

              {/* Real-time Monitoring */}
              <div className="monitoring-section">
                <h3>Real-time Monitoring</h3>
                <div className="monitoring-grid">
                  <div className="monitor-card">
                    <h4>Live Visitors</h4>
                    <div className="monitor-value">
                      <AnimatedValue value={Math.round(1245 + stats.visitors)} />
                    </div>
                    <div className="monitor-graph">
                      {[...Array(20)].map((_, i) => (
                        <motion.div 
                          key={i}
                          className="graph-bar"
                          animate={{ 
                            height: `${20 + Math.random() * 60}%`,
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="monitor-card">
                    <h4>Active Sessions</h4>
                    <div className="monitor-value">
                      <AnimatedValue value={Math.round(87 + stats.visitors / 10)} />
                    </div>
                    <div className="session-dots">
                      {[...Array(50)].map((_, i) => (
                        <motion.div 
                          key={i}
                          className="session-dot"
                          animate={{ 
                            scale: [0.5, 1, 0.5],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{ 
                            duration: 2 + Math.random(), 
                            repeat: Infinity,
                            delay: Math.random() * 2
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="monitor-card">
                    <h4>Server Status</h4>
                    <div className="status-indicator online">
                      <div className="status-dot"></div>
                      <span>All Systems Operational</span>
                    </div>
                    <div className="server-stats">
                      <div className="server-stat">
                        <span>CPU Usage</span>
                        <div className="stat-bar">
                          <motion.div 
                            className="stat-fill"
                            initial={{ width: '45%' }}
                            animate={{ width: `${45 + Math.random() * 10}%` }}
                            transition={{ duration: 2, repeat: Infinity }}
                          ></motion.div>
                        </div>
                      </div>
                      <div className="server-stat">
                        <span>Memory</span>
                        <div className="stat-bar">
                          <motion.div 
                            className="stat-fill"
                            initial={{ width: '62%' }}
                            animate={{ width: `${62 + Math.random() * 8}%` }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          ></motion.div>
                        </div>
                      </div>
                      <div className="server-stat">
                        <span>Disk</span>
                        <div className="stat-bar">
                          <motion.div 
                            className="stat-fill"
                            initial={{ width: '28%' }}
                            animate={{ width: `${28 + Math.random() * 5}%` }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Products Section */}
          {activeSection === 'products' && (
            <motion.section
              className="products-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="section-header">
                <h2>Product Management</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button className="primary-btn" onClick={() => setIsAddProductOpen(true)}>+ Add Product</button>
                  <button className="secondary-btn" onClick={loadProductsData}>🔄 Refresh</button>
                </div>
              </div>

              {/* Product Filters */}
              <div className="filters-bar">
                <div className="container">
                  <div className="filters-left">
                    <button
                      className="filter-toggle"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                      Filters
                      <span className="filter-count">
                        {Object.values(productFilters).flat().length > 0 ? Object.values(productFilters).flat().length : ''}
                      </span>
                    </button>

                    <div className="active-filters">
                      {productFilters.category.map(filter => (
                        <span key={filter} className="active-filter">
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          <button onClick={() => handleFilterToggle('category', filter)}>×</button>
                        </span>
                      ))}
                      {productFilters.size.map(filter => (
                        <span key={filter} className="active-filter">
                          Size: {filter.toUpperCase()}
                          <button onClick={() => handleFilterToggle('size', filter)}>×</button>
                        </span>
                      ))}
                      {productFilters.color.map(filter => (
                        <span key={filter} className="active-filter">
                          Color: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          <button onClick={() => handleFilterToggle('color', filter)}>×</button>
                        </span>
                      ))}
                      {productFilters.price.map(filter => (
                        <span key={filter} className="active-filter">
                          {filterOptions.price.find(opt => opt.value === filter)?.label}
                          <button onClick={() => handleFilterToggle('price', filter)}>×</button>
                        </span>
                      ))}
                      {Object.values(productFilters).flat().length > 0 && (
                        <button className="clear-filters" onClick={clearAllFilters}>
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="filters-right">
                    <p className="results-count">{totalProducts} products</p>

                    <div className="sort-dropdown">
                      <button
                        className="sort-toggle"
                        onClick={() => setIsSortOpen(!isSortOpen)}
                      >
                        Sort: {sortOptions.find(opt => opt.value === selectedSort)?.label}
                      </button>

                      <AnimatePresence>
                        {isSortOpen && (
                          <motion.div
                            className="sort-options"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {sortOptions.map(option => (
                              <button
                                key={option.value}
                                className={selectedSort === option.value ? 'active' : ''}
                                onClick={() => {
                                  setSelectedSort(option.value);
                                  setIsSortOpen(false);
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="plp-container">
                <div className="container">
                  {/* Filters Sidebar */}
                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        className="filters-sidebar"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="filter-group">
                          <h3>Category</h3>
                          {filterOptions.category.map(option => (
                            <label key={option.value} className="filter-checkbox">
                              <input
                                type="checkbox"
                                checked={productFilters.category.includes(option.value)}
                                onChange={() => handleFilterToggle('category', option.value)}
                              />
                              <span className="checkmark"></span>
                              {option.label}
                            </label>
                          ))}
                        </div>

                        <div className="filter-group">
                          <h3>Size</h3>
                          <div className="size-filters">
                            {filterOptions.size.map(option => (
                              <button
                                key={option.value}
                                className={`size-filter ${productFilters.size.includes(option.value) ? 'active' : ''}`}
                                onClick={() => handleFilterToggle('size', option.value)}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="filter-group">
                          <h3>Color</h3>
                          {filterOptions.color.map(option => (
                            <label key={option.value} className="filter-checkbox">
                              <input
                                type="checkbox"
                                checked={productFilters.color.includes(option.value)}
                                onChange={() => handleFilterToggle('color', option.value)}
                              />
                              <span className="checkmark"></span>
                              {option.label}
                            </label>
                          ))}
                        </div>

                        <div className="filter-group">
                          <h3>Price</h3>
                          {filterOptions.price.map(option => (
                            <label key={option.value} className="filter-checkbox">
                              <input
                                type="checkbox"
                                checked={productFilters.price.includes(option.value)}
                                onChange={() => handleFilterToggle('price', option.value)}
                              />
                              <span className="checkmark"></span>
                              {option.label}
                            </label>
                          ))}
                        </div>

                        <button className="apply-filters" onClick={() => setIsFilterOpen(false)}>
                          Apply Filters
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Products Grid */}
                  <div className="products-grid-container">
                    {loadingProducts ? (
                      <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading products...</p>
                      </div>
                    ) : products && products.length > 0 ? (
                      <>
                        <div className="products-grid">
                          {products.map(product => (
                            <motion.div
                              key={product?.id || Math.random()}
                              className="product-card"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              whileHover={{ y: -5 }}
                            >
                              <div className="product-image">
                                <img
                                  src={product?.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                                  alt={product?.name || 'Product'}
                                  onError={(e) => {
                                    e.target.src = '/placeholder.png';
                                  }}
                                />
                                <button className="wishlist-btn">♥</button>

                                {product?.sale_price && (
                                  <span className="sale-badge">SALE</span>
                                )}
                                {product?.status === 'draft' && (
                                  <span className="new-badge">DRAFT</span>
                                )}

                                <div className="product-actions">
                                  <button className="quick-view" onClick={() => handleEditProduct(product)}>Edit</button>
                                  <button className="add-to-bag" onClick={() => handleDeleteProduct(product?.id)}>Delete</button>
                                </div>
                              </div>

                              <div className="product-info">
                                <div className="product-meta">
                                  <span className="product-name">{product?.name || 'Unnamed Product'}</span>
                                </div>

                                <div className="product-price">
                                  {product?.sale_price ? (
                                    <>
                                      <span className="sale-price">${product.sale_price}</span>
                                      <span className="original-price">${product.price}</span>
                                    </>
                                  ) : (
                                    <span>${product?.price || '0'}</span>
                                  )}
                                </div>

                                <div className="product-colors">
                                  <span className="color-dot" style={{
                                    backgroundColor: product?.colors && product.colors.length > 0
                                      ? (product.colors[0].toLowerCase() || '#000')
                                      : '#000'
                                  }}></span>
                                  <span>+{product?.colors ? product.colors.length : 0} colors</span>
                                </div>

                                <div className="product-rating">
                                  {renderStars(product?.rating || 0)}
                                  <span>({product?.review_count || 0})</span>
                                </div>

                                <div className="product-status">
                                  <span className={`status-badge status-${product?.status || 'active'}`}>
                                    {(product?.status || 'active').replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="pagination">
                            <button
                              className={`pagination-btn ${!hasPrev ? 'disabled' : ''}`}
                              onClick={() => hasPrev && paginate(productPage - 1)}
                              disabled={!hasPrev}
                            >
                              Previous
                            </button>

                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (productPage <= 3) {
                                pageNum = i + 1;
                              } else if (productPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = productPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  className={`pagination-btn ${productPage === pageNum ? 'active' : ''}`}
                                  onClick={() => paginate(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}

                            <button
                              className={`pagination-btn ${!hasNext ? 'disabled' : ''}`}
                              onClick={() => hasNext && paginate(productPage + 1)}
                              disabled={!hasNext}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="no-products">
                        <h2>No products found</h2>
                        <p>Try adjusting your filters to see more results</p>
                        <button className="clear-filters-btn" onClick={clearAllFilters}>
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Orders Section */}
       {activeSection === 'orders' && (
           <motion.section
               className="orders-section"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
           >
               <div className="section-header">
               <h2>Order Management</h2>
               <div>
                   <button className="primary-btn" style={{marginRight: '10px'}} onClick={handleExportOrders}>Export Orders</button>
                   <button className="primary-btn" onClick={() => setShowNewOrderModal(true)}>+ New Order</button>
               </div>
               </div>

               {/* Order Statistics */}
               <div className="quick-stats-grid">
               <div className="quick-stat-card" style={{borderLeftColor: '#4caf50'}}>
                   <div className="quick-stat-value">{orderStats.total_orders || '...'}</div>
                   <div className="quick-stat-label">Total Orders</div>
               </div>
               <div className="quick-stat-card" style={{borderLeftColor: '#2196f3'}}>
                   <div className="quick-stat-value">{orderStats.pending_orders || '...'}</div>
                   <div className="quick-stat-label">Pending</div>
               </div>
               <div className="quick-stat-card" style={{borderLeftColor: '#ff9800'}}>
                   <div className="quick-stat-value">{orderStats.average_order_value ? `₹${orderStats.average_order_value.toLocaleString()}` : '...'}</div>
                   <div className="quick-stat-label">Avg Order Value</div>
               </div>
               <div className="quick-stat-card" style={{borderLeftColor: '#9c27b0'}}>
                   <div className="quick-stat-value">₹{orderStats.total_revenue ? orderStats.total_revenue.toLocaleString() : '...'}</div>
                   <div className="quick-stat-label">Total Revenue</div>
               </div>
               </div>

               {/* Order Filters and Search */}
               <div className="filters-bar">
                   <div className="container">
                       <div className="filters-left">
                           <button
                               className="filter-toggle"
                               onClick={() => setIsOrderFilterOpen(!isOrderFilterOpen)}
                           >
                               Filters
                               <span className="filter-count">
                                   {Object.values(orderFilters).flat().length > 0 ? Object.values(orderFilters).flat().length : ''}
                               </span>
                           </button>

                           <div className="active-filters">
                               {orderFilters.status.map(filter => (
                                   <span key={filter} className="active-filter">
                                       Status: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                       <button onClick={() => handleOrderFilterToggle('status', filter)}>×</button>
                                   </span>
                               ))}
                               {orderFilters.payment_status.map(filter => (
                                   <span key={filter} className="active-filter">
                                       Payment: {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                       <button onClick={() => handleOrderFilterToggle('payment_status', filter)}>×</button>
                                   </span>
                               ))}               

                              <div className="filter-dropdown">
                                <select
                                  value={orderStatusFilter}
                                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                                  className="filter-select"
                                >
                                  <option value="">All Statuses</option>
                                  {orderStatusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Payment Status Filter */}
                              <div className="filter-dropdown">
                                <select
                                  value={paymentStatusFilter}
                                  onChange={(e) => handlePaymentStatusFilterChange(e.target.value)}
                                  className="filter-select"
                                >
                                  <option value="">All Payment Status</option>
                                  {paymentStatusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Date Range Filter */}
                              <div className="date-filter-group">
                                <input
                                  type="date"
                                  value={dateRangeFilter.from}
                                  onChange={(e) => handleDateRangeFilter(e.target.value, dateRangeFilter.to)}
                                  placeholder="From Date"
                                  className="date-input"
                                />
                                <span>to</span>
                                <input
                                  type="date"
                                  value={dateRangeFilter.to}
                                  onChange={(e) => handleDateRangeFilter(dateRangeFilter.from, e.target.value)}
                                  placeholder="To Date"
                                  className="date-input"
                                />
                              </div>

                              {Object.values(orderFilters).flat().length > 0 && (
                                <button className="clear-filters" onClick={clearAllOrderFilters}>
                                  Clear all
                                </button>
                              )}

                           </div>
                       </div>

                       <div className="filters-right">
                           <p className="results-count">{totalOrders} orders</p>

                           <div className="sort-dropdown">
                               <button
                                   className="sort-toggle"
                                   onClick={() => setIsOrderSortOpen(!isOrderSortOpen)}
                               >
                                   Sort: {orderSortOptions.find(opt => opt.value === selectedOrderSort)?.label}
                               </button>

                               <AnimatePresence>
                                   {isOrderSortOpen && (
                                       <motion.div
                                           className="sort-options"
                                           initial={{ opacity: 0, y: -10 }}
                                           animate={{ opacity: 1, y: 0 }}
                                           exit={{ opacity: 0, y: -10 }}
                                           transition={{ duration: 0.2 }}
                                       >
                                           {orderSortOptions.map(option => (
                                               <button
                                                   key={option.value}
                                                   className={selectedOrderSort === option.value ? 'active' : ''}
                                                   onClick={() => {
                                                       setSelectedOrderSort(option.value);
                                                       setIsOrderSortOpen(false);
                                                   }}
                                               >
                                                   {option.label}
                                               </button>
                                           ))}
                                       </motion.div>
                                   )}
                               </AnimatePresence>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Order Filters Sidebar */}
               <AnimatePresence>
                   {isOrderFilterOpen && (
                       <motion.div
                           className="filters-sidebar"
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           transition={{ duration: 0.3 }}
                       >
                           <div className="filter-group">
                               <h3>Order Status</h3>
                               {orderStatusOptions.map(option => (
                                   <label key={option.value} className="filter-checkbox">
                                       <input
                                           type="checkbox"
                                           checked={orderFilters.status.includes(option.value)}
                                           onChange={() => handleOrderFilterToggle('status', option.value)}
                                       />
                                       <span className="checkmark"></span>
                                       {option.label}
                                   </label>
                               ))}
                           </div>

                           <div className="filter-group">
                               <h3>Payment Status</h3>
                               {paymentStatusOptions.map(option => (
                                   <label key={option.value} className="filter-checkbox">
                                       <input
                                           type="checkbox"
                                           checked={orderFilters.payment_status.includes(option.value)}
                                           onChange={() => handleOrderFilterToggle('payment_status', option.value)}
                                       />
                                       <span className="checkmark"></span>
                                       {option.label}
                                   </label>
                               ))}
                           </div>

                           <div className="filter-group">
                               <h3>Date Range</h3>
                               <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                   <input
                                       type="date"
                                       value={orderFilters.date_from || ''}
                                       onChange={(e) => setOrderFilters(prev => ({...prev, date_from: e.target.value}))}
                                       placeholder="From"
                                   />
                                   <input
                                       type="date"
                                       value={orderFilters.date_to || ''}
                                       onChange={(e) => setOrderFilters(prev => ({...prev, date_to: e.target.value}))}
                                       placeholder="To"
                                   />
                               </div>
                           </div>

                           <button className="apply-filters" onClick={() => setIsOrderFilterOpen(false)}>
                               Apply Filters
                           </button>
                       </motion.div>
                   )}
               </AnimatePresence>

               {/* Orders Table */}
               <div className="data-table-container">
                   <div className="table-header">
                       <h3>Orders</h3>
                       <div className="table-actions">
                           <input
                               type="text"
                               placeholder="Search orders..."
                               value={orderSearchQuery}
                               onChange={(e) => setOrderSearchQuery(e.target.value)}
                               className="search-input"
                           />
                           <button className="primary-btn" onClick={loadOrdersData}>🔄 Refresh</button>
                       </div>
                   </div>

                   <div className="data-table">
                       <div className="table-header-row">
                           <div className="table-cell">
                               <input
                                   type="checkbox"
                                   checked={selectedOrders.length === orders.length && orders.length > 0}
                                   onChange={handleSelectAllOrders}
                               />
                           </div>
                           <div className="table-cell">Order ID</div>
                           <div className="table-cell">Customer</div>
                           <div className="table-cell">Status</div>
                           <div className="table-cell">Payment</div>
                           <div className="table-cell">Total</div>
                           <div className="table-cell">Date</div>
                           <div className="table-cell">Actions</div>
                       </div>

                       {loadingOrders ? (
                           <div className="loading-row">Loading orders...</div>
                       ) : orders.length === 0 ? (
                           <div className="empty-row">No orders found</div>
                       ) : (
                           orders.map((order) => (
                               <div key={order.id} className="table-row">
                                   <div className="table-cell">
                                       <input
                                           type="checkbox"
                                           checked={selectedOrders.includes(order.id)}
                                           onChange={() => handleSelectOrder(order.id)}
                                       />
                                   </div>
                                   <div className="table-cell">
                                       <strong>{order.order_number}</strong>
                                   </div>
                                    <div className="table-cell">
                                      {order.user ? (
                                        <div>
                                          <div><strong>{order.user.first_name} {order.user.last_name}</strong></div>
                                          <div style={{fontSize: '12px', color: '#666'}}>{order.user.email}</div>
                                        </div>
                                      ) : order.customer_email ? (
                                        <div>
                                          <div><strong>Guest Customer</strong></div>
                                          <div style={{fontSize: '12px', color: '#666'}}>{order.customer_email}</div>
                                        </div>
                                      ) : (
                                        'N/A'
                                      )}
                                    </div>
                                   <div className="table-cell">
                                       <select
                                           value={order.status}
                                           onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                           className={`status-select status-${order.status}`}
                                       >
                                           {orderStatusOptions.map(option => (
                                               <option key={option.value} value={option.value}>
                                                   {option.label}
                                               </option>
                                           ))}
                                       </select>
                                   </div>
                                   <div className="table-cell">
                                       <span className={`status-badge status-${order.payment_status}`}>
                                           {order.payment_status}
                                       </span>
                                   </div>
                                   <div className="table-cell">₹{order.total_amount.toLocaleString()}</div>
                                   <div className="table-cell">
                                       {new Date(order.created_at).toLocaleDateString()}
                                   </div>
                                   <div className="table-cell">
                                       <button
                                           className="action-btn view-btn"
                                           onClick={() => handleViewOrderDetails(order)}
                                       >
                                           View
                                       </button>
                                       <button
                                           className="action-btn edit-btn"
                                           onClick={() => handleEditOrder(order)}
                                       >
                                           Edit
                                       </button>
                                   </div>
                               </div>
                           ))
                       )}
                   </div>

                   {/* Bulk Actions */}
                   {selectedOrders.length > 0 && (
                       <div className="bulk-actions">
                           <span>{selectedOrders.length} orders selected</span>
                           <select
                               value={bulkOrderStatus}
                               onChange={(e) => setBulkOrderStatus(e.target.value)}
                           >
                               <option value="">Bulk Update Status</option>
                               {orderStatusOptions.map(option => (
                                   <option key={option.value} value={option.value}>
                                       {option.label}
                                   </option>
                               ))}
                           </select>
                           <button
                               className="primary-btn"
                               onClick={handleBulkOrderUpdate}
                               disabled={!bulkOrderStatus}
                           >
                               Apply
                           </button>
                           <button
                               className="secondary-btn"
                               onClick={() => setSelectedOrders([])}
                           >
                               Clear
                           </button>
                       </div>
                   )}

                   {/* Pagination */}
                   {totalOrderPages > 1 && (
                       <div className="pagination">
                           <button
                               className={`pagination-btn ${!hasOrderPrev ? 'disabled' : ''}`}
                               onClick={() => hasOrderPrev && setOrderPage(orderPage - 1)}
                               disabled={!hasOrderPrev}
                           >
                               Previous
                           </button>

                           {Array.from({ length: Math.min(totalOrderPages, 5) }, (_, i) => {
                               let pageNum;
                               if (totalOrderPages <= 5) {
                                   pageNum = i + 1;
                               } else if (orderPage <= 3) {
                                   pageNum = i + 1;
                               } else if (orderPage >= totalOrderPages - 2) {
                                   pageNum = totalOrderPages - 4 + i;
                               } else {
                                   pageNum = orderPage - 2 + i;
                               }
                               return (
                                   <button
                                       key={pageNum}
                                       className={`pagination-btn ${orderPage === pageNum ? 'active' : ''}`}
                                       onClick={() => setOrderPage(pageNum)}
                                   >
                                       {pageNum}
                                   </button>
                               );
                           })}

                           <button
                               className={`pagination-btn ${!hasOrderNext ? 'disabled' : ''}`}
                               onClick={() => hasOrderNext && setOrderPage(orderPage + 1)}
                               disabled={!hasOrderNext}
                           >
                               Next
                           </button>
                       </div>
                   )}
               </div>

               {/* Order Details Modal */}
               {showOrderDetailsModal && selectedOrder && (
                   <div className="modal-overlay" onClick={() => setShowOrderDetailsModal(false)}>
                       <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                           <div className="modal-header">
                               <h3>Order Details - {selectedOrder.order_number}</h3>
                               <button
                                   className="close-btn"
                                   onClick={() => setShowOrderDetailsModal(false)}
                               >
                                   ×
                               </button>
                           </div>

                           <div className="order-details-content">
                               <div className="order-info-grid">
                                   <div className="info-section">
                                       <h4>Order Information</h4>
                                       <div className="info-grid">
                                           <div><strong>Order ID:</strong> {selectedOrder.order_number}</div>
                                           <div><strong>Status:</strong>
                                               <select
                                                   value={selectedOrder.status}
                                                   onChange={(e) => handleOrderStatusUpdate(selectedOrder.id, e.target.value)}
                                                   className={`status-select status-${selectedOrder.status}`}
                                               >
                                                   {orderStatusOptions.map(option => (
                                                       <option key={option.value} value={option.value}>
                                                           {option.label}
                                                       </option>
                                                   ))}
                                               </select>
                                           </div>
                                           <div><strong>Payment Status:</strong>
                                               <span className={`status-badge status-${selectedOrder.payment_status}`}>
                                                   {selectedOrder.payment_status}
                                               </span>
                                           </div>
                                           <div><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                                           <div><strong>Shipping Method:</strong> {selectedOrder.shipping_method}</div>
                                           <div><strong>Payment Method:</strong> {selectedOrder.payment_method}</div>
                                           {selectedOrder.tracking_number && (
                                               <div><strong>Tracking Number:</strong> {selectedOrder.tracking_number}</div>
                                           )}
                                       </div>
                                   </div>

                                   <div className="info-section">
                                       <h4>Customer Information</h4>
                                       <div className="info-grid">
                                           {selectedOrder.user && (
                                               <>
                                                   <div><strong>Name:</strong> {selectedOrder.user.first_name} {selectedOrder.user.last_name}</div>
                                                   <div><strong>Email:</strong> {selectedOrder.user.email}</div>
                                               </>
                                           )}
                                           <div><strong>Shipping Address:</strong></div>
                                           <div style={{gridColumn: 'span 2'}}>
                                               {selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}<br/>
                                               {selectedOrder.shipping_address.address_line_1}<br/>
                                               {selectedOrder.shipping_address.address_line_2 && <>{selectedOrder.shipping_address.address_line_2}<br/></>}
                                               {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}<br/>
                                               {selectedOrder.shipping_address.country}
                                           </div>
                                       </div>
                                   </div>
                               </div>

                               <div className="order-items-section">
                                   <h4>Order Items</h4>
                                   <div className="order-items-table">
                                       <div className="table-header-row">
                                           <div className="table-cell">Product</div>
                                           <div className="table-cell">Quantity</div>
                                           <div className="table-cell">Price</div>
                                           <div className="table-cell">Total</div>
                                       </div>
                                       {selectedOrder.items.map((item, index) => (
                                           <div key={index} className="table-row">
                                               <div className="table-cell">
                                                   {item.product ? item.product.name : 'Product'}
                                                   {item.size && <span className="item-variant">Size: {item.size}</span>}
                                                   {item.color && <span className="item-variant">Color: {item.color}</span>}
                                               </div>
                                               <div className="table-cell">{item.quantity}</div>
                                               <div className="table-cell">₹{item.price.toLocaleString()}</div>
                                               <div className="table-cell">₹{item.subtotal.toLocaleString()}</div>
                                           </div>
                                       ))}
                                   </div>
                               </div>

                               <div className="order-summary-section">
                                   <div className="order-totals">
                                       <div className="total-row">
                                           <span>Subtotal:</span>
                                           <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                                       </div>
                                       <div className="total-row">
                                           <span>Tax:</span>
                                           <span>₹{selectedOrder.tax_amount.toLocaleString()}</span>
                                       </div>
                                       <div className="total-row">
                                           <span>Shipping:</span>
                                           <span>₹{selectedOrder.shipping_cost.toLocaleString()}</span>
                                       </div>
                                       {selectedOrder.discount_amount > 0 && (
                                           <div className="total-row discount">
                                               <span>Discount:</span>
                                               <span>-₹{selectedOrder.discount_amount.toLocaleString()}</span>
                                           </div>
                                       )}
                                       <div className="total-row grand-total">
                                           <span>Total:</span>
                                           <span>₹{selectedOrder.total_amount.toLocaleString()}</span>
                                       </div>
                                   </div>
                               </div>

                               {selectedOrder.notes && (
                                   <div className="order-notes-section">
                                       <h4>Order Notes</h4>
                                       <p>{selectedOrder.notes}</p>
                                   </div>
                               )}

                               <div className="order-actions">
                                   <button
                                       className="primary-btn"
                                       onClick={() => handlePrintOrder(selectedOrder)}
                                   >
                                       Print Order
                                   </button>
                                   <button
                                       className="primary-btn"
                                       onClick={() => handleSendOrderEmail(selectedOrder)}
                                   >
                                       Send Email
                                   </button>
                                   <button
                                       className="secondary-btn"
                                       onClick={() => setShowOrderDetailsModal(false)}
                                   >
                                       Close
                                   </button>
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {/* New Order Modal */}
               {showNewOrderModal && (
                   <div className="modal-overlay" onClick={() => setShowNewOrderModal(false)}>
                       <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                           <div className="modal-header">
                               <h3>Create New Order</h3>
                               <button
                                   className="close-btn"
                                   onClick={() => setShowNewOrderModal(false)}
                               >
                                   ×
                               </button>
                           </div>

                           <div className="new-order-form">
                               <div className="form-section">
                                   <h4>Customer Information</h4>
                                   <div className="form-grid">
                                       <div className="form-group">
                                           <label>Customer Email:</label>
                                           <input
                                               type="email"
                                               value={newOrderData.customer_email}
                                               onChange={(e) => setNewOrderData(prev => ({...prev, customer_email: e.target.value}))}
                                               placeholder="customer@example.com"
                                           />
                                       </div>
                                       <div className="form-group">
                                           <label>Customer Name:</label>
                                           <input
                                               type="text"
                                               value={newOrderData.customer_name}
                                               onChange={(e) => setNewOrderData(prev => ({...prev, customer_name: e.target.value}))}
                                               placeholder="John Doe"
                                           />
                                       </div>
                                   </div>
                               </div>

                               <div className="form-section">
                                   <h4>Shipping Address</h4>
                                   <div className="form-grid">
                                       <div className="form-group">
                                           <label>First Name:</label>
                                           <input
                                               type="text"
                                               value={newOrderData.shipping_address.first_name}
                                               onChange={(e) => setNewOrderData(prev => ({
                                                   ...prev,
                                                   shipping_address: {...prev.shipping_address, first_name: e.target.value}
                                               }))}
                                           />
                                       </div>
                                       <div className="form-group">
                                           <label>Last Name:</label>
                                           <input
                                               type="text"
                                               value={newOrderData.shipping_address.last_name}
                                               onChange={(e) => setNewOrderData(prev => ({
                                                   ...prev,
                                                   shipping_address: {...prev.shipping_address, last_name: e.target.value}
                                               }))}
                                           />
                                       </div>
                                       <div className="form-group full-width">
                                           <label>Address Line 1:</label>
                                           <input
                                               type="text"
                                               value={newOrderData.shipping_address.address_line_1}
                                               onChange={(e) => setNewOrderData(prev => ({
                                                   ...prev,
                                                   shipping_address: {...prev.shipping_address, address_line_1: e.target.value}
                                               }))}
                                           />
                                       </div>
                                       <div className="form-group full-width">
                                           <label>Address Line 2:</label>
                                           <input
                                               type="text"
                                               value={newOrderData.shipping_address.address_line_2}
                                               onChange={(e) => setNewOrderData(prev => ({
                                                   ...prev,
                                                   shipping_address: {...prev.shipping_address, address_line_2: e.target.value}
                                               }))}
                                           />
                                       </div>
                                       <div className="form-group">
                                           <label>City:</label>
                                           <input
                                               type="text"
                                               value={newOrderData.shipping_address.city}
                                               onChange={(e) => setNewOrderData(prev => ({
                                                   ...prev,
                                                   shipping_address: {...prev.shipping_address, city: e.target.value}
                                               }))}
                                           />
                                       </div>
                                       <div className="form-group">
                                           <label>State:</label>
                                           <input
                                               type="text"
                                               value={newOrderData.shipping_address.state}
                                               onChange={(e) => setNewOrderData(prev => ({
                                                   ...prev,
                                                   shipping_address: {...prev.shipping_address, state: e.target.value}
                                               }))}
                                           />
                                       </div>
                                       <div className="form-group">
                                           <label>Postal Code:</label>
                                           <input
                                               type="text"
                                               value={newOrderData.shipping_address.postal_code}
                                               onChange={(e) => setNewOrderData(prev => ({
                                                   ...prev,
                                                   shipping_address: {...prev.shipping_address, postal_code: e.target.value}
                                               }))}
                                           />
                                       </div>
                                       <div className="form-group">
                                           <label>Country:</label>
                                           <input
                                               type="text"
                                               value={newOrderData.shipping_address.country}
                                               onChange={(e) => setNewOrderData(prev => ({
                                                   ...prev,
                                                   shipping_address: {...prev.shipping_address, country: e.target.value}
                                               }))}
                                           />
                                       </div>
                                   </div>
                               </div>

                               <div className="form-section">
                                   <h4>Order Items</h4>
                                   <div className="order-items-builder">
                                       {newOrderData.items.map((item, index) => (
                                           <div key={index} className="item-row">
                                               <input
                                                   type="text"
                                                   placeholder="Product ID"
                                                   value={item.product_id}
                                                   onChange={(e) => handleNewOrderItemChange(index, 'product_id', e.target.value)}
                                               />
                                               <input
                                                   type="number"
                                                   placeholder="Quantity"
                                                   value={item.quantity}
                                                   onChange={(e) => handleNewOrderItemChange(index, 'quantity', parseInt(e.target.value))}
                                                   min="1"
                                               />
                                               <input
                                                   type="number"
                                                   placeholder="Price"
                                                   value={item.price}
                                                   onChange={(e) => handleNewOrderItemChange(index, 'price', parseFloat(e.target.value))}
                                                   step="0.01"
                                                   min="0"
                                               />
                                               <button
                                                   type="button"
                                                   className="remove-item-btn"
                                                   onClick={() => removeNewOrderItem(index)}
                                               >
                                                   ×
                                               </button>
                                           </div>
                                       ))}
                                       <button
                                           type="button"
                                           className="add-item-btn"
                                           onClick={addNewOrderItem}
                                       >
                                           + Add Item
                                       </button>
                                   </div>
                               </div>

                               <div className="form-section">
                                   <h4>Order Settings</h4>
                                   <div className="form-grid">
                                       <div className="form-group">
                                           <label>Shipping Method:</label>
                                           <select
                                               value={newOrderData.shipping_method}
                                               onChange={(e) => setNewOrderData(prev => ({...prev, shipping_method: e.target.value}))}
                                           >
                                               <option value="standard">Standard Shipping</option>
                                               <option value="express">Express Shipping</option>
                                               <option value="overnight">Overnight Shipping</option>
                                           </select>
                                       </div>
                                       <div className="form-group">
                                           <label>Payment Method:</label>
                                           <select
                                               value={newOrderData.payment_method}
                                               onChange={(e) => setNewOrderData(prev => ({...prev, payment_method: e.target.value}))}
                                           >
                                               <option value="card">Credit Card</option>
                                               <option value="paypal">PayPal</option>
                                               <option value="bank_transfer">Bank Transfer</option>
                                               <option value="cash">Cash on Delivery</option>
                                           </select>
                                       </div>
                                   </div>
                               </div>

                               <div className="form-actions">
                                   <button
                                       type="button"
                                       className="primary-btn"
                                       onClick={handleCreateNewOrder}
                                   >
                                       Create Order
                                   </button>
                                   <button
                                       type="button"
                                       className="secondary-btn"
                                       onClick={() => setShowNewOrderModal(false)}
                                   >
                                       Cancel
                                   </button>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
           </motion.section>
           )}

            {/* Customers Section */}
            {activeSection === 'customers' && (
            <motion.section
                className="customers-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="section-header">
                <h2>Customer Management</h2>
                <button className="primary-btn" onClick={() => {
                  setEditingUser(null);
                  setUserFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    role: 'customer',
                    status: 'active'
                  });
                  setShowUserModal(true);
                }}>+ Add Customer</button>
                </div>
                <div className="performance-metrics">
                <div className="performance-card">
                    <h4>Customer Growth</h4>
                    <div className="metric-value">+{customers.length > 0 ? ((customers.filter(c => new Date(c.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length / customers.length) * 100).toFixed(1) : 0}%</div>
                    <p>Monthly growth rate</p>
                </div>
                <div className="performance-card">
                    <h4>Retention Rate</h4>
                    <div className="metric-value">{customers.length > 0 ? ((customers.filter(c => c.status === 'active').length / customers.length) * 100).toFixed(1) : 0}%</div>
                    <p>Customer retention</p>
                </div>
                <div className="performance-card">
                    <h4>Lifetime Value</h4>
                    <div className="metric-value">₹{customers.length > 0 ? (customers.reduce((sum, c) => sum + (typeof c.totalSpent === 'number' ? c.totalSpent : parseFloat(c.totalSpent) || 0), 0) / customers.length).toFixed(0).toLocaleString() : 0}</div>
                    <p>Average LTV</p>
                </div>
                </div>

                {/* Customer Table */}
                <div className="data-table-container">
                  <div className="table-header">
                    <h3>Customer List</h3>
                    <div className="table-actions">
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                    </div>
                  </div>
                  <div className="data-table">
                    <div className="table-header-row">
                      <div className="table-cell">Name</div>
                      <div className="table-cell">Email</div>
                      <div className="table-cell">Status</div>
                      <div className="table-cell">Last Active</div>
                      <div className="table-cell">Total Orders</div>
                      <div className="table-cell">Total Spent</div>
                      <div className="table-cell">Actions</div>
                    </div>
                    {loadingCustomers ? (
                      <div className="loading-row">Loading customers...</div>
                    ) : customers.length === 0 ? (
                      <div className="empty-row">No customers found</div>
                    ) : (
                      customers
                        .filter(customer =>
                          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((customer) => (
                          <div key={customer.id} className="table-row">
                            <div className="table-cell">{customer.name}</div>
                            <div className="table-cell">{customer.email}</div>
                            <div className="table-cell">
                              <span className={`status-badge status-${customer.status}`}>
                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                              </span>
                            </div>
                            <div className="table-cell">{customer.lastActive}</div>
                            <div className="table-cell">{customer.totalOrders}</div>
                            <div className="table-cell">₹{typeof customer.totalSpent === 'number' ? customer.totalSpent.toLocaleString() : customer.totalSpent}</div>
                            <div className="table-cell">
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleEditUser(customer)}
                              >
                                Edit
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteUser(customer.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Customer Modal */}
                {showUserModal && (
                  <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                      <h3>{editingUser ? 'Edit Customer' : 'Add Customer'}</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveUser(userFormData);
                      }}>
                        <div style={{marginBottom: '15px'}}>
                          <label>First Name:</label>
                          <input
                            type="text"
                            value={userFormData.first_name}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, first_name: capitalizeName(e.target.value) }))}
                            required
                          />
                        </div>
                        <div style={{marginBottom: '15px'}}>
                          <label>Last Name:</label>
                          <input
                            type="text"
                            value={userFormData.last_name}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, last_name: capitalizeName(e.target.value) }))}
                            required
                          />
                        </div>
                        <div style={{marginBottom: '15px'}}>
                          <label>Email:</label>
                          <input
                            type="email"
                            value={userFormData.email}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value.trim() }))}
                            required
                          />
                        </div>
                        <div style={{marginBottom: '15px'}}>
                          <label>Status:</label>
                          <select
                            value={userFormData.status}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, status: e.target.value }))}
                            required
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                        <div style={{display: 'flex', gap: '10px'}}>
                          <button type="submit" className="primary-btn">Save</button>
                          <button type="button" className="secondary-btn" onClick={() => setShowUserModal(false)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
            </motion.section>
            )}

            {/* Analytics Section */}
            {activeSection === 'analytics' && (
            <motion.section 
                className="analytics-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="section-header">
                <h2>Advanced Analytics</h2>
                <div className="date-filter">
                    <select>
                    <option>Real-time</option>
                    <option>Last 24 Hours</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    </select>
                </div>
                </div>
                <div className="charts-row">
                <div className="chart-card">
                  <h3>User Engagement</h3>
                  <LineChart data={revenueTrend.length > 0 ? revenueTrend.map((d, i) => ({ day: d.day, value: d.value / 1000 })) : []} />
                </div>
                <div className="chart-card">
                    <h3>Conversion Funnel</h3>
                    <div className="chart-container">
                    {/* Conversion funnel visualization would go here */}
                    </div>
                </div>
                </div>
                <p>Advanced analytics content goes here...</p>
            </motion.section>
            )}
{/* Marketing Section */}
{activeSection === 'marketing' && (
  <motion.section 
    className="marketing-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="section-header">
      <h2>Marketing Campaigns</h2>
      <button className="primary-btn">+ New Campaign</button>
    </div>

    <div className="marketing-stats">
      <div className="marketing-stat-card">
        <div className="marketing-stat-value">{marketingData.roi}%</div>
        <div className="marketing-stat-label">ROI</div>
        <div className="finance-trend trend-positive">↑ 15.2%</div>
      </div>
      <div className="marketing-stat-card">
        <div className="marketing-stat-value">{marketingData.clickRate}%</div>
        <div className="marketing-stat-label">Click Rate</div>
        <div className="finance-trend trend-positive">↑ 3.1%</div>
      </div>
      <div className="marketing-stat-card">
        <div className="marketing-stat-value">{(marketingData.impressions / 1000).toFixed(0)}K</div>
        <div className="marketing-stat-label">Impressions</div>
        <div className="finance-trend trend-positive">↑ 8.7%</div>
      </div>
      <div className="marketing-stat-card">
        <div className="marketing-stat-value">{marketingData.engagements.toLocaleString()}</div>
        <div className="marketing-stat-label">Engagements</div>
        <div className="finance-trend trend-positive">↑ 12.3%</div>
      </div>
    </div>

    <div className="campaigns-grid">
      <h3 style={{gridColumn: '1 / -1', marginBottom: '0'}}>Active Campaigns</h3>
      {campaigns.filter(c => c.status === 'active').map((campaign, index) => (
        <div key={index} className="campaign-card">
          <h4>{campaign.name}</h4>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
            <span>Progress</span>
            <span>{campaign.progress}%</span>
          </div>
          <div className="campaign-progress">
            <motion.div 
              className="campaign-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${campaign.progress}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              style={{ background: '#2196f3' }}
            ></motion.div>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '10px'}}>
            <span>Spent: ₹{campaign.spent.toLocaleString()}</span>
            <span>Budget: ₹{campaign.budget.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="chart-card">
      <h3>Campaign Performance</h3>
      <LineChart data={revenueTrend.length > 0 ? revenueTrend.map((d, i) => ({ day: d.day, value: d.value / 500 })) : []} />
    </div>
  </motion.section>
)}

{/* Inventory Section */}
{activeSection === 'inventory' && (
  <motion.section 
    className="inventory-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="section-header">
      <h2>Inventory Management</h2>
      <button className="primary-btn">+ Add Product</button>
    </div>

    <div className="inventory-grid">
      {inventoryItems.map((item, index) => (
        <motion.div 
          key={index}
          className={`inventory-item ${
            item.stock < 10 ? 'low-stock' : 
            item.stock < 50 ? 'medium-stock' : ''
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <h4>{item.name}</h4>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666'}}>
            <span>Category: {item.category}</span>
            <span>Stock: {item.stock}/{item.total}</span>
          </div>
          <div className="stock-level">
            <motion.div 
              className="stock-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(item.stock / item.total) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
              style={{
                background: item.stock < 10 ? '#f44336' : 
                           item.stock < 50 ? '#ff9800' : '#4caf50'
              }}
            ></motion.div>
          </div>
          <button className="primary-btn" style={{width: '100%', marginTop: '10px', padding: '8px'}}>
            {item.stock < 10 ? 'Urgent Restock' : 'Manage Stock'}
          </button>
        </motion.div>
      ))}
    </div>

    <div className="inventory-alerts">
      <h3>Stock Alerts</h3>
      <div className="alert-list">
        {inventoryAlerts.map((alert, index) => (
          <div key={index} className={`alert-item ${alert.type}`}>
            <div className="alert-icon">
              {alert.type === 'low' ? '⚠️' : '🔔'}
            </div>
            <div style={{flex: 1}}>
              <strong>{alert.product}</strong>
              <div>Only {alert.stock} units left (min: {alert.threshold})</div>
            </div>
            <button className="primary-btn" style={{padding: '5px 10px', fontSize: '12px'}}>
              Order Now
            </button>
          </div>
        ))}
      </div>
    </div>
  </motion.section>
)}

{/* Settings Section */}
{activeSection === 'settings' && (
  <motion.section 
    className="settings-section"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="section-header">
      <h2>System Settings</h2>
      <button className="primary-btn">Save Changes</button>
    </div>

    <div className="settings-grid">
      <div className="setting-card">
        <h4>Notification Preferences</h4>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>Email Notifications</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.emailNotifications} onChange={() => handleSettingChange('emailNotifications')} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>SMS Alerts</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.smsAlerts} onChange={() => handleSettingChange('smsAlerts')} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>Auto Backup</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.autoBackup} onChange={() => handleSettingChange('autoBackup')} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-card">
        <h4>Security Settings</h4>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>Two-Factor Authentication</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.twoFactorAuth} onChange={() => handleSettingChange('twoFactorAuth')} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0'}}>
          <span>Dark Mode</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={settings.darkMode} onChange={() => handleSettingChange('darkMode')} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <button 
          className="primary-btn" 
          style={{width: '100%', marginTop: '20px'}}
          onClick={() => setIsChangePasswordOpen(true)}
        >
          Change Password
        </button>
      </div>

      <div className="setting-card">
          <h4>System Information</h4>
          <div style={{margin: '15px 0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 0'}}>
              <span>Version</span>
              <span>v2.1.4</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 0'}}>
              <span>Last Update</span>
              <span>2025-01-10</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 0'}}>
              <span>Database Size</span>
              <span>245 MB</span>
            </div>
          </div>
        </div>
      </div>
 
      <div className="system-health">
        <h3 style={{gridColumn: '1 / -1'}}>System Health</h3>
        {systemStatus.length > 0 ? systemStatus.map((service, index) => (
          <div key={index} className="health-card">
            <div className={`health-status status-${service.status}`}></div>
            <h5>{service.service}</h5>
            <div style={{fontSize: '14px', color: '#666'}}>Uptime: {service.uptime}</div>
          </div>
        )) : (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666'}}>Loading system status...</div>
        )}
      </div>
  </motion.section>
)}

        {/* Users Section */}
        {activeSection === 'users' && (
        <motion.section
            className="users-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>User Management</h2>
            <button className="primary-btn" onClick={() => {
              setEditingUser(null);
              setUserFormData({
                first_name: '',
                last_name: '',
                email: '',
                role: 'customer',
                status: 'active'
              });
              setShowUserModal(true);
            }}>+ Add User</button>
            </div>

            <div className="users-grid">
            {loadingUsers ? (
                <div style={{textAlign: 'center', padding: '40px'}}>Loading users...</div>
            ) : users.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px'}}>No users found</div>
            ) : (
                users.map((user, index) => (
                    <div key={user.id || index} className="user-card">
                    <div className="user-avatar">
                        {user.name && user.name.split(' ').map(n => n[0]).join('') || user.email.charAt(0).toUpperCase()}
                    </div>
                    <h4>{user.name}</h4>
                    <p style={{color: '#666', margin: '5px 0'}}>{user.email}</p>
                    <div className={`user-role role-${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                    <div className={`user-status status-${user.status}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </div>
                    <p style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>
                        Last active: {user.lastActive}
                    </p>
                    <div style={{display: 'flex', gap: '5px', marginTop: '15px'}}>
                        <button
                            className="primary-btn"
                            style={{flex: 1, padding: '8px', fontSize: '12px'}}
                            onClick={() => handleEditUser(user)}
                        >
                            Edit
                        </button>
                        <button
                            className="secondary-btn"
                            style={{flex: 1, padding: '8px', fontSize: '12px'}}
                            onClick={() => handleDeleteUser(user.id)}
                        >
                            Delete
                        </button>
                    </div>
                    </div>
                ))
            )}
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveUser(userFormData);
                        }}>
                            <div style={{marginBottom: '15px'}}>
                                <label>First Name:</label>
                                <input
                                    type="text"
                                    value={userFormData.first_name}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, first_name: capitalizeName(e.target.value) }))}
                                    required
                                />
                            </div>
                            <div style={{marginBottom: '15px'}}>
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    value={userFormData.last_name}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, last_name: capitalizeName(e.target.value) }))}
                                    required
                                />
                            </div>
                            <div style={{marginBottom: '15px'}}>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={userFormData.email}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value.trim() }))}
                                    required
                                />
                            </div>
                            <div style={{marginBottom: '15px'}}>
                                <label>Role:</label>
                                <select
                                    value={userFormData.role}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                                    required
                                >
                                    <option value="customer">Customer</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{marginBottom: '15px'}}>
                                <label>Status:</label>
                                <select
                                    value={userFormData.status}
                                    onChange={(e) => setUserFormData(prev => ({ ...prev, status: e.target.value }))}
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit" className="primary-btn">Save</button>
                                <button type="button" className="secondary-btn" onClick={() => setShowUserModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.section>
        )}

        {/* Finance Section */}
        {activeSection === 'finance' && (
        <motion.section 
            className="finance-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Financial Overview</h2>
            <button className="primary-btn">Download Report</button>
            </div>

            <div className="finance-metrics">
            <div className="finance-card">
                <h4>Total Revenue</h4>
                <div className="metric-value">₹{financeData.revenue.toLocaleString()}</div>
                <div className="finance-trend trend-positive">↑ {financeData.growth}%</div>
            </div>
            <div className="finance-card">
                <h4>Expenses</h4>
                <div className="metric-value">₹{financeData.expenses.toLocaleString()}</div>
                <div className="finance-trend trend-negative">↑ 8.2%</div>
            </div>
            <div className="finance-card">
                <h4>Net Profit</h4>
                <div className="metric-value">₹{financeData.profit.toLocaleString()}</div>
                <div className="finance-trend trend-positive">↑ 15.7%</div>
            </div>
            <div className="finance-card">
                <h4>Profit Margin</h4>
                <div className="metric-value">{((financeData.profit / financeData.revenue) * 100).toFixed(1)}%</div>
                <div className="finance-trend trend-positive">↑ 2.3%</div>
            </div>
            </div>

            <div className="charts-row">
            <div className="chart-card">
                <h3>Revenue Trend</h3>
                <LineChart data={revenueTrend.length > 0 ? revenueTrend : []} />
            </div>
            <div className="chart-card">
                <h3>Expense Breakdown</h3>
                <div className="chart-container">
                {/* Pie chart would go here */}
                <div style={{textAlign: 'center', padding: '40px'}}>
                    <div style={{fontSize: '48px'}}>📊</div>
                    <p>Expense chart visualization</p>
                </div>
                </div>
            </div>
            </div>
        </motion.section>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
        <motion.section
            className="notifications-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Notifications Center</h2>
            <button className="primary-btn">Mark All Read</button>
            </div>

            <div className="notifications-list">
            <div className="notification-item unread">
                <div className="notification-icon">🔔</div>
                <div className="notification-content">
                <h4>Low Stock Alert</h4>
                <p>Premium Leather Jacket is running low on stock (12 units remaining)</p>
                <span className="notification-time">2 minutes ago</span>
                </div>
                <button className="notification-action">View</button>
            </div>
            <div className="notification-item">
                <div className="notification-icon">📦</div>
                <div className="notification-content">
                <h4>New Order Received</h4>
                <p>Order #IWX789012 has been placed for ₹247.50</p>
                <span className="notification-time">15 minutes ago</span>
                </div>
                <button className="notification-action">Process</button>
            </div>
            <div className="notification-item">
                <div className="notification-icon">👥</div>
                <div className="notification-content">
                <h4>New Customer Registration</h4>
                <p>Sarah Johnson has created a new account</p>
                <span className="notification-time">1 hour ago</span>
                </div>
                <button className="notification-action">Welcome</button>
            </div>
            </div>
        </motion.section>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
        <motion.section
            className="security-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Security Center</h2>
            <button className="primary-btn" onClick={handleRunSecurityScan}>Run Security Scan</button>
            </div>

            <div className="security-grid">
            <div className="security-card">
                <h4>Login Attempts</h4>
                <div className="security-metric">{securityStats.total_login_attempts?.toLocaleString() || '0'}</div>
                <p>Total login attempts</p>
                <div className="security-status safe">All Clear</div>
            </div>
            <div className="security-card">
                <h4>Failed Attempts</h4>
                <div className="security-metric">{securityStats.failed_logins || 0}</div>
                <p>Failed login attempts</p>
                <div className={`security-status ${securityStats.failed_logins > 10 ? 'warning' : 'safe'}`}>
                  {securityStats.failed_logins > 10 ? 'Monitor' : 'Normal'}
                </div>
            </div>
            <div className="security-card">
                <h4>Active Sessions</h4>
                <div className="security-metric">{securityStats.active_sessions || 0}</div>
                <p>Current active sessions</p>
                <div className="security-status safe">Normal</div>
            </div>
            <div className="security-card">
                <h4>Security Score</h4>
                <div className="security-metric">
                  {securityStats.total_login_attempts > 0 ?
                    Math.round((securityStats.successful_logins / securityStats.total_login_attempts) * 100) : 100}%
                </div>
                <p>Overall security rating</p>
                <div className="security-status excellent">Excellent</div>
            </div>
            </div>

            <div className="security-tabs">
              <button
                className={`tab-btn ${securityTab === 'events' ? 'active' : ''}`}
                onClick={() => setSecurityTab('events')}
              >
                Security Events
              </button>
              <button
                className={`tab-btn ${securityTab === 'login-history' ? 'active' : ''}`}
                onClick={() => setSecurityTab('login-history')}
              >
                Login History
              </button>
              <button
                className={`tab-btn ${securityTab === 'devices' ? 'active' : ''}`}
                onClick={() => setSecurityTab('devices')}
              >
                Connected Devices
              </button>
            </div>

            {securityTab === 'events' && (
              <div className="recent-activity">
                <h3>Recent Security Events</h3>
                <div className="activity-list">
                  {securityEvents.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>No security events found</div>
                  ) : (
                    securityEvents.map((event, index) => (
                      <div key={event.id || index} className="activity-item">
                        <span className="activity-time">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                        <span>
                          {event.event_type.replace('_', ' ').toUpperCase()}: {event.details?.message || 'Event occurred'}
                          {event.user_id && ` (User: ${event.user_id})`}
                        </span>
                        <span className={`event-severity severity-${event.severity || 1}`}>
                          {event.severity === 5 ? 'Critical' : event.severity === 4 ? 'High' : event.severity === 3 ? 'Medium' : event.severity === 2 ? 'Low' : 'Info'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {securityTab === 'login-history' && (
              <div className="login-history">
                <h3>Login History</h3>
                <div className="history-list">
                  {loginHistory.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>No login history found</div>
                  ) : (
                    loginHistory.map((login, index) => (
                      <div key={login.id || index} className="history-item">
                        <div className="history-info">
                          <strong>{login.user_id}</strong>
                          <span>{new Date(login.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="history-details">
                          <span>IP: {login.ip_address}</span>
                          <span>Device: {login.device_type}</span>
                          <span className={`login-status status-${login.status}`}>
                            {login.status}
                          </span>
                        </div>
                        {login.failure_reason && (
                          <div className="failure-reason">
                            Reason: {login.failure_reason}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {securityTab === 'devices' && (
              <div className="devices-section">
                <h3>Connected Devices</h3>
                <div className="devices-list">
                  {connectedDevices.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>No connected devices found</div>
                  ) : (
                    connectedDevices.map((device, index) => (
                      <div key={device.id || index} className="device-item">
                        <div className="device-info">
                          <strong>{device.device_name || `${device.device_type} Device`}</strong>
                          <span>User: {device.user_id}</span>
                        </div>
                        <div className="device-details">
                          <span>Browser: {device.browser || 'Unknown'}</span>
                          <span>OS: {device.os || 'Unknown'}</span>
                          <span>Last used: {new Date(device.last_used).toLocaleString()}</span>
                        </div>
                        <div className={`device-status ${device.is_trusted ? 'trusted' : 'untrusted'}`}>
                          {device.is_trusted ? 'Trusted' : 'Untrusted'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
        </motion.section>
        )}

        {/* Integrations Section */}
        {activeSection === 'integrations' && (
        <motion.section
            className="integrations-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>API Integrations</h2>
            <button className="primary-btn">+ Add Integration</button>
            </div>

            <div className="integrations-grid">
            <div className="integration-card active">
                <div className="integration-icon">💳</div>
                <h4>Stripe Payments</h4>
                <p>Payment processing integration</p>
                <div className="integration-status active">Connected</div>
                <button className="secondary-btn">Configure</button>
            </div>
            <div className="integration-card active">
                <div className="integration-icon">📧</div>
                <h4>SendGrid Email</h4>
                <p>Email delivery service</p>
                <div className="integration-status active">Connected</div>
                <button className="secondary-btn">Configure</button>
            </div>
            <div className="integration-card">
                <div className="integration-icon">📦</div>
                <h4>Shippo Shipping</h4>
                <p>Shipping and tracking</p>
                <div className="integration-status inactive">Not Connected</div>
                <button className="primary-btn">Connect</button>
            </div>
            <div className="integration-card">
                <div className="integration-icon">📊</div>
                <h4>Google Analytics</h4>
                <p>Website analytics</p>
                <div className="integration-status inactive">Not Connected</div>
                <button className="primary-btn">Connect</button>
            </div>
            </div>
        </motion.section>
        )}

        {/* Backups Section */}
        {activeSection === 'backups' && (
        <motion.section
            className="backups-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Data Backups</h2>
            <button className="primary-btn">Create Backup</button>
            </div>

            <div className="backup-stats">
            <div className="backup-stat-card">
                <div className="backup-stat-value">24</div>
                <div className="backup-stat-label">Total Backups</div>
            </div>
            <div className="backup-stat-card">
                <div className="backup-stat-value">2.4GB</div>
                <div className="backup-stat-label">Storage Used</div>
            </div>
            <div className="backup-stat-card">
                <div className="backup-stat-value">98.7%</div>
                <div className="backup-stat-label">Success Rate</div>
            </div>
            <div className="backup-stat-card">
                <div className="backup-stat-value">Daily</div>
                <div className="backup-stat-label">Auto Backup</div>
            </div>
            </div>

            <div className="recent-backups">
            <h3>Recent Backups</h3>
            <div className="backup-list">
                <div className="backup-item">
                <div className="backup-info">
                    <h4>Full System Backup</h4>
                    <p>Database + Files + Configuration</p>
                    <span className="backup-size">1.2GB</span>
                </div>
                <div className="backup-status success">Completed</div>
                <span className="backup-time">2 hours ago</span>
                <button className="secondary-btn">Download</button>
                </div>
                <div className="backup-item">
                <div className="backup-info">
                    <h4>Database Only</h4>
                    <p>All tables and data</p>
                    <span className="backup-size">856MB</span>
                </div>
                <div className="backup-status success">Completed</div>
                <span className="backup-time">1 day ago</span>
                <button className="secondary-btn">Download</button>
                </div>
            </div>
            </div>
        </motion.section>
        )}

        {/* Logs Section */}
        {activeSection === 'logs' && (
        <motion.section
            className="logs-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>System Logs</h2>
            <div style={{display: 'flex', gap: '10px'}}>
                <select style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd'}}>
                <option>All Logs</option>
                <option>Errors Only</option>
                <option>Warnings</option>
                <option>Info</option>
                </select>
                <button className="primary-btn">Export Logs</button>
            </div>
            </div>

            <div className="logs-container">
            <div className="log-entry error">
                <span className="log-time">14:32:15</span>
                <span className="log-level error">ERROR</span>
                <span className="log-message">Failed to connect to payment gateway</span>
            </div>
            <div className="log-entry warning">
                <span className="log-time">14:28:42</span>
                <span className="log-level warning">WARN</span>
                <span className="log-message">High memory usage detected (87%)</span>
            </div>
            <div className="log-entry info">
                <span className="log-time">14:25:18</span>
                <span className="log-level info">INFO</span>
                <span className="log-message">User admin@iwx.com logged in</span>
            </div>
            <div className="log-entry success">
                <span className="log-time">14:20:33</span>
                <span className="log-level success">SUCCESS</span>
                <span className="log-message">Order IWX789012 processed successfully</span>
            </div>
            </div>
        </motion.section>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && (
        <motion.section
            className="reports-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Reports & Analytics</h2>
            <button className="primary-btn">Generate New Report</button>
            </div>

            <div className="reports-grid">
            <div className="report-card">
                <div className="report-icon">📈</div>
                <h4>Sales Report</h4>
                <p>Detailed analysis of sales performance and trends</p>
                <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>Last updated: Today</div>
            </div>
            <div className="report-card">
                <div className="report-icon">👥</div>
                <h4>Customer Insights</h4>
                <p>Customer behavior and demographic analysis</p>
                <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>Last updated: 2 days ago</div>
            </div>
            <div className="report-card">
                <div className="report-icon">📊</div>
                <h4>Financial Summary</h4>
                <p>Revenue, expenses, and profit analysis</p>
                <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>Last updated: 1 week ago</div>
            </div>
            <div className="report-card">
                <div className="report-icon">🛒</div>
                <h4>Inventory Report</h4>
                <p>Stock levels and inventory turnover analysis</p>
                <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>Last updated: 3 days ago</div>
            </div>
            </div>

            <CalendarWidget />
        </motion.section>
        )}

        {/* Help Section */}
        {activeSection === 'help' && (
        <motion.section
            className="help-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="section-header">
            <h2>Help & Support</h2>
            <button className="primary-btn">Contact Support</button>
            </div>

            <div className="support-grid">
            <div className="support-card">
                <div className="support-icon">📚</div>
                <h4>Documentation</h4>
                <p>Complete guide to using the admin dashboard</p>
            </div>
            <div className="support-card">
                <div className="support-icon">🎓</div>
                <h4>Tutorials</h4>
                <p>Step-by-step video tutorials</p>
            </div>
            <div className="support-card">
                <div className="support-icon">❓</div>
                <h4>FAQ</h4>
                <p>Frequently asked questions</p>
            </div>
            <div className="support-card">
                <div className="support-icon">💬</div>
                <h4>Live Chat</h4>
                <p>24/7 customer support</p>
            </div>
            </div>

            <div className="setting-card" style={{marginTop: '30px'}}>
            <h4>Quick Actions</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px'}}>
                <button className="primary-btn" style={{padding: '10px'}}>Reset Password</button>
                <button className="primary-btn" style={{padding: '10px'}}>System Diagnostics</button>
                <button className="primary-btn" style={{padding: '10px'}}>Export Data</button>
                <button className="primary-btn" style={{padding: '10px'}}>Backup System</button>
            </div>
            </div>
        </motion.section>
        )}
        </AnimatePresence>
      </main>
      <ChangePassword
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {isAddProductOpen && (
        <AddProductForm
          onClose={() => {
            setIsAddProductOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setIsAddProductOpen(false);
            setEditingProduct(null);
            loadProductsData(); // Refresh products data
          }}
          editingProduct={editingProduct}
        />
      )}



    </div>
  );
};


export default AdminDashboard;
