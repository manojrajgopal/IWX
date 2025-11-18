import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  userRole: localStorage.getItem('userRole') || 'user',
  isAuthenticated: !!localStorage.getItem('token'),
  rememberMe: localStorage.getItem('rememberMe') === 'true',
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user || action.payload.user;
      state.token = action.payload.token;
      state.userRole = action.payload.user?.role || 'user';
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userRole', state.userRole);
      // Store remember me preference if provided
      if (action.payload.rememberMe !== undefined) {
        state.rememberMe = action.payload.rememberMe;
        localStorage.setItem('rememberMe', action.payload.rememberMe.toString());
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.userRole = 'user';
      // Clear remember me on login failure
      state.rememberMe = false;
      localStorage.removeItem('rememberMe');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userRole = 'user';
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // Clear remember me on logout
      state.rememberMe = false;
      localStorage.removeItem('rememberMe');
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
