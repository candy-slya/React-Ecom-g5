export const MAX_CART_ITEM_QUANTITY = 2147483647;

export interface GuestCartItem {
  variantId: number;
  quantity: number;
}

export interface CartItemResponse {
  cartItemId: number;
  variantId: number;
  productId: number;
  productName: string;
  imageUrl: string;
  sku: string;
  options: Record<string, string>;
  quantity: number;
  effectivePrice: number;
  subtotal: number;
  availableQuantity: number;
  stockStatus: string;
  available: boolean;
}

export interface CartResponse {
  cartId: number | null;
  status: string;
  totalQuantity: number;
  totalAmount: number;
  items: CartItemResponse[];
}

export interface GuestCartResolveItemRequest {
  variantId: number;
  quantity: number;
}

export interface GuestCartResolveRequest {
  items: GuestCartResolveItemRequest[];
}

export interface GuestCartResolvedItemResponse {
  variantId: number;
  productId: number | null;
  productName: string | null;
  imageUrl: string | null;
  sku: string | null;
  options: Record<string, string>;
  quantity: number;
  effectivePrice: number;
  subtotal: number;
  availableQuantity: number;
  stockStatus: string;
  available: boolean;
}

export interface GuestCartResolveResponse {
  totalQuantity: number;
  totalAmount: number;
  items: GuestCartResolvedItemResponse[];
}

export interface UpdateCartItemQuantityRequest {
  quantity: number;
}

export interface CartState {
  guestItems: GuestCartItem[];
  resolvedGuestCart: GuestCartResolveResponse | null;
  authenticatedCart: CartResponse | null;
  loading: boolean;
  error: string | null;
}

export interface CartMergeRequest {
  items: GuestCartItem[];
}

export interface CartMergeRejectedItem {
  variantId: number;
  reason: string;
}

export interface CartMergeResponse {
  mergedVariantIds: number[];
  rejectedItems: CartMergeRejectedItem[];
}
