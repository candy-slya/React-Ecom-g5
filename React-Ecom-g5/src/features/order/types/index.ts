export interface OrderItemSummary {
  productName: string;
  qty: number;
}

export interface OrderListResponse {
  orderId: number;
  orderNo: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItemSummary[];
  trackingNumbers: string[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface OrderItemSnapshot {
  orderItemId: number;
  productName: string;
  variantAttributes: string;
  qty: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
}

export interface OrderAddressSnapshot {
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  township: string;
  city: string;
  regionOrState?: string;
}

export interface OrderPaymentSummary {
  paymentMethod: string;
  paymentStatus: string;
  transactionRef: string;
  amount: number;
  paidAt?: string;
}

export interface OrderStatusHistory {
  oldStatus: string | null;
  newStatus: string;
  remark: string | null;
  changedAt: string;
}

export interface ShipmentTracking {
  courierName: string | null;
  trackingNumber: string | null;
  shipmentStatus: string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface OrderDetailResponse {
  orderId: number;
  orderNo: string;
  createdAt: string;
  orderStatus: string;
  paymentStatus: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  items: OrderItemSnapshot[];
  shippingAddress: OrderAddressSnapshot;
  payment: OrderPaymentSummary;
  statusHistory: OrderStatusHistory[];
  shipments: ShipmentTracking[];
}

