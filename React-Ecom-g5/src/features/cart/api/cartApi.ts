import { axiosClient } from '../../../api/axiosClient';
import type { 
  CartResponse, 
  GuestCartResolveRequest, 
  GuestCartResolveResponse,
  UpdateCartItemQuantityRequest,
  CartMergeRequest,
  CartMergeResponse
} from '../types';

export interface AddToCartRequest {
  variantId: number;
  quantity: number;
}

export interface AddToCartResponse {
  cartItemId: number;
  cartId: number;
  variantId: number;
  quantity: number;
}

export const cartApi = {
  addItem: async (request: AddToCartRequest): Promise<AddToCartResponse> => {
    const response = await axiosClient.post('/v1/cart/items', request);
    return response.data;
  },
  
  resolveGuestCart: async (request: GuestCartResolveRequest): Promise<GuestCartResolveResponse> => {
    const response = await axiosClient.post('/v1/cart/guest/resolve', request);
    return response.data;
  },
  
  getCart: async (): Promise<CartResponse> => {
    const response = await axiosClient.get('/v1/cart');
    return response.data;
  },
  
  updateItemQuantity: async (cartItemId: number, request: UpdateCartItemQuantityRequest): Promise<void> => {
    const response = await axiosClient.put(`/v1/cart/items/${cartItemId}`, request);
    return response.data;
  },
  
  removeItem: async (cartItemId: number): Promise<void> => {
    const response = await axiosClient.delete(`/v1/cart/items/${cartItemId}`);
    return response.data;
  },

  mergeGuestCart: async (request: CartMergeRequest): Promise<CartMergeResponse> => {
    const response = await axiosClient.post('/v1/cart/merge', request);
    return response.data;
  }
};
