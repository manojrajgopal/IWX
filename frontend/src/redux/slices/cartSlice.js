import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api/cartAPI';

const initialState = {
  items: [],
  subtotal: 0,
  tax_amount: 0,
  shipping_cost: 0,
  total_amount: 0,
  itemCount: 0,
  loading: false,
  error: null,
  wsConnected: false,
};

// Async thunks for API calls
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch cart');
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async ({ productId, quantity = 1, size = null, color = null }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity, size, color);
      return response.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to add item to cart');
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity, size = null, color = null }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.updateCartQuantity(productId, quantity, size, color);
      return response.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update cart item');
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async ({ productId, size = null, color = null }, { rejectWithValue }) => {
    try {
      const response = await cartAPI.removeFromCart(productId, size, color);
      return response.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove item from cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.subtotal = action.payload.subtotal || 0;
      state.tax_amount = action.payload.tax_amount || 0;
      state.shipping_cost = action.payload.shipping_cost || 0;
      state.total_amount = action.payload.total_amount || 0;
      state.itemCount = action.payload.item_count || 0;
    },
    updateCartFromWS: (state, action) => {
      // Update cart from WebSocket message
      const cartData = action.payload;
      state.items = cartData.items || [];
      state.subtotal = cartData.subtotal || 0;
      state.tax_amount = cartData.tax_amount || 0;
      state.shipping_cost = cartData.shipping_cost || 0;
      state.total_amount = cartData.total_amount || 0;
      state.itemCount = cartData.item_count || 0;
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax_amount = 0;
      state.shipping_cost = 0;
      state.total_amount = 0;
      state.itemCount = 0;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setWSConnected: (state, action) => {
      state.wsConnected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.subtotal = action.payload.subtotal || 0;
        state.tax_amount = action.payload.tax_amount || 0;
        state.shipping_cost = action.payload.shipping_cost || 0;
        state.total_amount = action.payload.total_amount || 0;
        state.itemCount = action.payload.item_count || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.subtotal = action.payload.subtotal || 0;
        state.tax_amount = action.payload.tax_amount || 0;
        state.shipping_cost = action.payload.shipping_cost || 0;
        state.total_amount = action.payload.total_amount || 0;
        state.itemCount = action.payload.item_count || 0;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.subtotal = action.payload.subtotal || 0;
        state.tax_amount = action.payload.tax_amount || 0;
        state.shipping_cost = action.payload.shipping_cost || 0;
        state.total_amount = action.payload.total_amount || 0;
        state.itemCount = action.payload.item_count || 0;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.subtotal = action.payload.subtotal || 0;
        state.tax_amount = action.payload.tax_amount || 0;
        state.shipping_cost = action.payload.shipping_cost || 0;
        state.total_amount = action.payload.total_amount || 0;
        state.itemCount = action.payload.item_count || 0;
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCart,
  updateCartFromWS,
  clearCart,
  setLoading,
  setError,
  setWSConnected
} = cartSlice.actions;

export default cartSlice.reducer;
