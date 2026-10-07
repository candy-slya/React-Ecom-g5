export type RefundReason = 
  | 'DAMAGED_ITEM'
  | 'DEFECTIVE_PRODUCT'
  | 'MISSING_PARTS'
  | 'ORDERED_BY_MISTAKE'
  | 'WRONG_ITEM_SENT'
  | 'OTHER';

export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RefundRequestDto {
  orderItemId: number;
  refundQuantity: number;
  requestReason: RefundReason;
}

export interface RefundResponseDto {
  refundId: number;
  orderItemId: number;
  productName: string;
  variantAttributes: string;
  orderedQuantity: number;
  requestedRefundQuantity: number;
  remainingRefundableQuantity: number;
  requestReason: RefundReason;
  refundAmount: number;
  status: RefundStatus;
  requestedAt: string;
}

export interface RefundEligibilityDto {
  orderItemId: number;
  orderedQuantity: number;
  alreadyReservedRefundQuantity: number;
  remainingRefundableQuantity: number;
  canRequestRefund: boolean;
}
