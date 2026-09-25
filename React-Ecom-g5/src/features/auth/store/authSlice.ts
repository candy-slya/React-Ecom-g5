import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import { authTokenStorage } from '../utils/authTokenStorage';
import type { Customer, LoginRequest, RegisterRequest } from '../types';
import { isAxiosError } from 'axios';

interface AuthState {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  customer: null,
  token: authTokenStorage.getToken(),
  isAuthenticated: false,
  isInitializing: true,
  loading: false,
  error: null,
};

const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (isAxiosError(error) && typeof error.response?.data === 'string') {
    return error.response.data;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const login = createAsyncThunk(
  'auth/login',
  async (request: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(request);
      authTokenStorage.setToken(response.token);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (request: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(request);
      authTokenStorage.setToken(response.token);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    const token = authTokenStorage.getToken();
    if (!token) {
      return null;
    }
    
    try {
      const response = await authApi.getCurrentCustomer();
      return response;
    } catch (error) {
      authTokenStorage.clearToken();
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authTokenStorage.clearToken();
      state.customer = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.customer = {
          customerId: action.payload.customerId,
          fullName: action.payload.fullName,
          email: action.payload.email,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.customer = {
          customerId: action.payload.customerId,
          fullName: action.payload.fullName,
          email: action.payload.email,
        };
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitializing = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.customer = {
            customerId: action.payload.customerId,
            fullName: action.payload.fullName,
            email: action.payload.email,
            phone: action.payload.phone,
          };
        } else {
          state.isAuthenticated = false;
          state.customer = null;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.customer = null;
        state.token = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
