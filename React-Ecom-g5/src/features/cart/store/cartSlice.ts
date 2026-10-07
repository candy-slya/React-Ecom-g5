import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartState } from '../types';
import { MAX_CART_ITEM_QUANTITY } from '../types';
import { guestCartStorage } from '../utils/guestCartStorage';
import { logout } from '../../auth/store/authSlice';
import { cartApi, type AddToCartRequest } from '../api/cartApi';
import { isAxiosError } from 'axios';

const initialState: CartState = {
  guestItems: guestCartStorage.load(),
  resolvedGuestCart: null,
  authenticatedCart: null,
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

export const addAuthenticatedCartItem = createAsyncThunk(
  'cart/addAuthenticatedCartItem',
  async (request: AddToCartRequest, { rejectWithValue }) => {
    try {
      const response = await cartApi.addItem(request);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const resolveGuestCartAsync = createAsyncThunk(
  'cart/resolveGuestCartAsync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const guestItems = state.cart.guestItems;

      if (!guestItems || guestItems.length === 0) {
        return {
          totalQuantity: 0,
          totalAmount: 0,
          items: [],
        };
      }

      const response = await cartApi.resolveGuestCart({ items: guestItems });
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchAuthenticatedCart = createAsyncThunk(
  'cart/fetchAuthenticatedCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateAuthenticatedCartItemQuantity = createAsyncThunk(
  'cart/updateAuthenticatedCartItemQuantity',
  async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.updateItemQuantity(cartItemId, { quantity });
      dispatch(fetchAuthenticatedCart());
      return cartItemId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const removeAuthenticatedCartItem = createAsyncThunk(
  'cart/removeAuthenticatedCartItem',
  async (cartItemId: number, { dispatch, rejectWithValue }) => {
    try {
      await cartApi.removeItem(cartItemId);
      dispatch(fetchAuthenticatedCart());
      return cartItemId;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const mergeGuestCartAsync = createAsyncThunk(
  'cart/mergeGuestCartAsync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const guestItems = state.cart.guestItems;

      if (!guestItems || guestItems.length === 0) {
        return {
          mergedVariantIds: [],
          rejectedItems: [],
        };
      }

      const response = await cartApi.mergeGuestCart({ items: guestItems });
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addGuestItem: (state, action: PayloadAction<{ variantId: number; quantity: number }>) => {
      const { variantId, quantity } = action.payload;
      
      if (!Number.isSafeInteger(variantId) || variantId <= 0) return;
      if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > MAX_CART_ITEM_QUANTITY) return;

      const existingItem = state.guestItems.find((item) => item.variantId === variantId);
      
      if (existingItem) {
        const combined = existingItem.quantity + quantity;
        if (combined <= MAX_CART_ITEM_QUANTITY) {
          existingItem.quantity = combined;
        }
      } else {
        state.guestItems.push({ variantId, quantity });
      }
      
      guestCartStorage.save(state.guestItems);
    },

    setGuestItemQuantity: (state, action: PayloadAction<{ variantId: number; quantity: number }>) => {
      const { variantId, quantity } = action.payload;
      
      if (!Number.isSafeInteger(variantId) || variantId <= 0) return;
      if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > MAX_CART_ITEM_QUANTITY) return;

      const existingItem = state.guestItems.find((item) => item.variantId === variantId);
      if (existingItem) {
        existingItem.quantity = quantity;
        guestCartStorage.save(state.guestItems);
      }
    },

    removeGuestItem: (state, action: PayloadAction<number>) => {
      const variantId = action.payload;
      state.guestItems = state.guestItems.filter((item) => item.variantId !== variantId);
      guestCartStorage.save(state.guestItems);
    },

    clearGuestCart: (state) => {
      state.guestItems = [];
      guestCartStorage.clear();
    },

    clearCartError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.authenticatedCart = null;
      state.loading = false;
      state.error = null;
    });

    builder.addCase(addAuthenticatedCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addAuthenticatedCartItem.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(addAuthenticatedCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(resolveGuestCartAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(resolveGuestCartAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.resolvedGuestCart = action.payload;
    });
    builder.addCase(resolveGuestCartAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchAuthenticatedCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAuthenticatedCart.fulfilled, (state, action) => {
      state.loading = false;
      state.authenticatedCart = action.payload;
    });
    builder.addCase(fetchAuthenticatedCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateAuthenticatedCartItemQuantity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAuthenticatedCartItemQuantity.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateAuthenticatedCartItemQuantity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(removeAuthenticatedCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeAuthenticatedCartItem.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(removeAuthenticatedCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(mergeGuestCartAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(mergeGuestCartAsync.fulfilled, (state, action) => {
      state.loading = false;
      const mergedIds = action.payload.mergedVariantIds || [];
      if (mergedIds.length > 0) {
        state.guestItems = state.guestItems.filter(
          item => !mergedIds.includes(item.variantId)
        );
        guestCartStorage.save(state.guestItems);
      }
    });
    builder.addCase(mergeGuestCartAsync.rejected, (state, action) => {
      state.loading = false;
      // We don't want a merge error to completely block the UI if the user logged in successfully,
      // but we can store it in state.error so a subtle toast/banner could be shown.
      state.error = action.payload as string;
    });
  }
});

export const {
  addGuestItem,
  setGuestItemQuantity,
  removeGuestItem,
  clearGuestCart,
  clearCartError,
} = cartSlice.actions;

export const selectGuestTotalQuantity = (state: { cart: CartState }) => {
  let total = 0;
  for (const item of state.cart.guestItems) {
    total += item.quantity;
    if (total > Number.MAX_SAFE_INTEGER) {
      return Number.MAX_SAFE_INTEGER;
    }
  }
  return total;
};

export default cartSlice.reducer;
