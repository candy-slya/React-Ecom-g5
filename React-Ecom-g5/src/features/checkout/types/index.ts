export interface CustomShippingAddressRequest {
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  township: string;
  city: string;
  regionOrState?: string;
}

export interface CreateOrderRequest {
  savedAddressId?: number | null;
  shippingAddress?: CustomShippingAddressRequest | null;
}

export interface OrderResponse {
  orderId: number;
  orderNo: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface CustomerAddressResponse {
  addressId: number;
  label: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  township: string;
  city: string;
  regionOrState?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface DeliveryZoneResponse {
  zoneId: number;
  zoneCode: string;
  zoneName: string;
  city: string;
  township?: string;
  regionOrState?: string;
  shippingFee: number;
  estimatedDays?: number;
}

export interface ShippingQuoteResponse {
  shippingRateId: number;
  zoneId: number;
  zoneCode: string;
  zoneName: string;
  city: string;
  township?: string;
  shippingFee: number;
  estimatedDays?: number;
}
