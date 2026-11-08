import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import type { OrderDetailResponse } from '../types';
import { formatPrice, formatDateTime, formatPaymentMethod } from '../../../utils/formatters';
import { getOrderStatusBadge, getPaymentStatusBadge } from '../../../utils/statusBadges';
import { OrderTimeline } from '../components/OrderTimeline';
import { ShipmentInformation } from '../components/ShipmentInformation';
import { refundApi } from '../../refund/api/refundApi';
import type { RefundEligibilityDto, RefundResponseDto } from '../../refund/types';
import { RequestRefundModal, type RefundableItemData } from '../../refund/components/RequestRefundModal';

export interface OrderDeliveryInfo {
  isDelivered: boolean;
  deliveredAt: string | null;
  isExpired: boolean;
  daysRemaining: number;
  ineligibleReason?: string;
}

const computeDeliveryInfo = (order: OrderDetailResponse | null): OrderDeliveryInfo => {
  if (!order) {
    return {
      isDelivered: false,
      deliveredAt: null,
      isExpired: false,
      daysRemaining: 0,
      ineligibleReason: 'Order not found.',
    };
  }

  // 1. Check if delivered (checks status, status history, shipments, and refunded state)
  const hasDeliveredHistory = order.statusHistory?.some(h => h.newStatus === 'DELIVERED') ?? false;
  const orderIsDelivered = order.orderStatus === 'DELIVERED' || order.orderStatus === 'REFUNDED' || hasDeliveredHistory;
  const deliveredShipment = order.shipments?.find(s => s.shipmentStatus === 'DELIVERED');
  const hasDeliveredShipment = Boolean(deliveredShipment);

  if (!orderIsDelivered && !hasDeliveredShipment) {
    return {
      isDelivered: false,
      deliveredAt: null,
      isExpired: false,
      daysRemaining: 0,
      ineligibleReason: 'Refunds can only be requested after the order has been delivered.',
    };
  }

  // 2. Resolve delivery timestamp
  let deliveredAt: string | null = deliveredShipment?.deliveredAt || null;

  if (!deliveredAt && order.statusHistory) {
    const historyDelivered = [...order.statusHistory]
      .reverse()
      .find(h => h.newStatus === 'DELIVERED');
    if (historyDelivered?.changedAt) {
      deliveredAt = historyDelivered.changedAt;
    }
  }

  if (!deliveredAt) {
    deliveredAt = order.createdAt;
  }

  const deliveredDate = new Date(deliveredAt);
  const now = new Date();
  const diffTime = now.getTime() - deliveredDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays > 7) {
    return {
      isDelivered: true,
      deliveredAt,
      isExpired: true,
      daysRemaining: 0,
      ineligibleReason: 'The 7-day refund request window has expired.',
    };
  }

  const remainingDays = Math.max(1, Math.ceil(7 - diffDays));

  return {
    isDelivered: true,
    deliveredAt,
    isExpired: false,
    daysRemaining: remainingDays,
  };
};

const OrderItemRow: React.FC<{
  item: any;
  eligibility?: RefundEligibilityDto;
  existingRefund?: RefundResponseDto;
}> = ({ item, eligibility, existingRefund }) => {
  // Merge status, quantities and rejection remark from eligibility or existingRefund
  const effectiveStatus = eligibility?.refundStatus || existingRefund?.status || null;
  const effectiveReservedQty = eligibility?.alreadyReservedRefundQuantity ?? existingRefund?.requestedRefundQuantity ?? 0;
  const effectiveRemark = eligibility?.remark || existingRefund?.remark || null;

  return (
    <div className="flex flex-col sm:flex-row justify-between py-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="flex flex-col mb-2 sm:mb-0">
        <span className="font-medium text-text-main text-base">{item.productName}</span>
        {item.variantAttributes && item.variantAttributes !== '{}' && (
          <span className="text-sm text-text-muted mt-1">
            {Object.entries(JSON.parse(item.variantAttributes)).map(([k, v]) => `${k}: ${v}`).join(', ')}
          </span>
        )}
        <span className="text-sm text-text-muted mt-1">
          Qty: {item.qty} × {formatPrice(item.unitPrice)}
        </span>
        
        {/* Refund Status Display */}
        {(effectiveReservedQty > 0 || effectiveStatus) && (
          <div className="mt-2 text-sm flex flex-col items-start gap-1">
            {effectiveReservedQty > 0 && (
              <span className={`font-semibold text-sm ${
                effectiveStatus === 'APPROVED' 
                  ? 'text-emerald-700' 
                  : effectiveStatus === 'REJECTED'
                  ? 'text-red-700'
                  : 'text-[#B7791F]'
              }`}>
                {effectiveStatus === 'APPROVED'
                  ? `Refund Approved: ${effectiveReservedQty}`
                  : effectiveStatus === 'REJECTED'
                  ? `Refund Rejected: ${effectiveReservedQty}`
                  : `Refund Requested: ${effectiveReservedQty}`}
              </span>
            )}
            {effectiveStatus && (
              <div>
                {effectiveStatus === 'PENDING' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Pending
                  </span>
                )}
                {effectiveStatus === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Approved
                  </span>
                )}
                {effectiveStatus === 'REJECTED' && (
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Rejected
                    </span>
                    {effectiveRemark && (
                      <div className="px-2.5 py-1.5 bg-red-50 border border-red-200/90 rounded-md text-xs text-red-800 max-w-md shadow-xs">
                        <span className="font-semibold text-red-900 mr-1">Rejection Reason:</span>
                        <span className="text-red-700 italic">"{effectiveRemark}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="sm:text-right mt-2 sm:mt-0 flex flex-col justify-end">
        {Boolean(item.discountAmount && item.discountAmount > 0) && (
          <p className="text-sm text-[#B42318] mb-1">
            Discount: -{formatPrice(item.discountAmount)}
          </p>
        )}
        <p className="font-bold text-text-main">{formatPrice(item.subtotal)}</p>
      </div>
    </div>
  );
};

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [myRefunds, setMyRefunds] = useState<RefundResponseDto[]>([]);
  const [eligibilities, setEligibilities] = useState<Record<number, RefundEligibilityDto>>({});
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderAndRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!orderId) throw new Error("Order ID is missing");
      
      // Load both order detail and customer refunds
      const [orderData, refundsData] = await Promise.all([
        orderApi.getOrderById(orderId),
        refundApi.getMyRefunds().catch(() => [] as RefundResponseDto[])
      ]);
      const typedOrder = orderData as unknown as OrderDetailResponse;
      setOrder(typedOrder);
      setMyRefunds(refundsData);

      // Fetch refund eligibility for all items in order
      const eligMap: Record<number, RefundEligibilityDto> = {};
      if (typedOrder.items && typedOrder.items.length > 0) {
        await Promise.all(
          typedOrder.items.map(async (item) => {
            try {
              const elig = await refundApi.getRefundEligibility(item.orderItemId);
              eligMap[item.orderItemId] = elig;
            } catch (e) {
              // fallback gracefully
            }
          })
        );
      }
      setEligibilities(eligMap);
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 401 || err?.response?.status === 403) {
        setError('Order not found or you do not have permission to view it.');
      } else {
        setError(err?.response?.data?.message || 'Failed to fetch order details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndRefunds();
  }, [orderId]);

  const handleBackToOrders = () => {
    if (order?.orderId) {
      sessionStorage.setItem('lastViewedOrderId', String(order.orderId));
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/orders');
    }
  };

  if (loading) {
    return (
      <div className="bg-page min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="text-text-muted text-lg font-medium">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-page min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="mx-auto max-w-xl rounded-lg border border-[#B42318]/20 bg-surface p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-[#B42318]">Oops!</h2>
          <p className="mb-6 text-text-main">{error || 'Order not found'}</p>
          <div className="space-x-4">
            <button
              onClick={handleBackToOrders}
              className="rounded-md border border-border-subtle bg-surface px-6 py-2 text-text-main font-bold hover:bg-page transition-colors"
            >
              Back to Orders
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary text-white px-6 py-2 font-bold hover:bg-primary-hover transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const deliveryInfo = computeDeliveryInfo(order);
  const hasApprovedRefunds = myRefunds.some(r => 
    order.items?.some(i => i.orderItemId === r.orderItemId) && r.status === 'APPROVED'
  );
  const hasRejectedRefunds = myRefunds.some(r => 
    order.items?.some(i => i.orderItemId === r.orderItemId) && r.status === 'REJECTED'
  );
  const hasPendingRefunds = myRefunds.some(r => 
    order.items?.some(i => i.orderItemId === r.orderItemId) && r.status === 'PENDING'
  );

  const rejectedRemarks = Array.from(
    new Set(
      order.items
        ?.map((item) => eligibilities[item.orderItemId]?.remark || myRefunds.find((r) => r.orderItemId === item.orderItemId)?.remark)
        .filter((rem): rem is string => Boolean(rem && rem.trim())) || []
    )
  );

  // Compute refundable items
  const isPaidForRefund = ['SUCCESS', 'PARTIALLY_REFUNDED'].includes(order.paymentStatus);
  const refundableItems: RefundableItemData[] = (order.items || [])
    .map((item) => {
      const elig = eligibilities[item.orderItemId];
      const existingRefund = myRefunds.find((r) => r.orderItemId === item.orderItemId);
      const isRejected = elig?.refundStatus === 'REJECTED' || existingRefund?.status === 'REJECTED';
      const isApproved = elig?.refundStatus === 'APPROVED' || existingRefund?.status === 'APPROVED';
      const isPending = elig?.refundStatus === 'PENDING' || existingRefund?.status === 'PENDING';

      const reservedQty = elig?.alreadyReservedRefundQuantity ?? existingRefund?.requestedRefundQuantity ?? 0;
      let remainingRefundableQuantity = elig 
        ? elig.remainingRefundableQuantity 
        : Math.max(0, item.qty - reservedQty);

      // If rejected, approved, pending, or ineligible: do not allow requesting refund again
      if (isRejected || isApproved || isPending || (elig && !elig.canRequestRefund)) {
        remainingRefundableQuantity = 0;
      }

      return {
        orderItemId: item.orderItemId,
        productName: item.productName,
        variantAttributes: item.variantAttributes,
        orderedQuantity: item.qty,
        remainingRefundableQuantity,
      };
    })
    .filter((item) => item.remainingRefundableQuantity > 0);

  const canRequestRefund = 
    isPaidForRefund &&
    deliveryInfo.isDelivered &&
    !deliveryInfo.isExpired &&
    refundableItems.length > 0;

  // Order Expired ONLY applies to unpaid PENDING orders whose reservation time has lapsed.
  // It NEVER applies to cancelled orders, paid orders, shipped/delivered orders, or orders with refunds.
  const isOrderExpired =
    order.orderStatus === 'PENDING' &&
    order.paymentStatus === 'PENDING' &&
    Boolean(
      order.isExpired ||
      order.reservationActive === false ||
      (order.reservationExpiresAt && new Date(order.reservationExpiresAt).getTime() <= Date.now())
    );

  return (
    <div className="bg-page min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={handleBackToOrders}
              className="text-text-muted hover:text-primary transition-colors flex items-center mb-4 text-sm font-medium cursor-pointer"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to My Orders
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-text-main">
              Order #{order.orderNo}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Placed on <span className="font-medium text-text-main">{formatDateTime(order.createdAt)}</span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-text-muted">Status:</span>
              {isOrderExpired ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B42318]/10 text-[#B42318]">
                  ORDER EXPIRED
                </span>
              ) : (
                getOrderStatusBadge(order.orderStatus)
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!isOrderExpired && <span className="text-sm font-medium text-text-muted">Payment:</span>}
              {!isOrderExpired && (
                order.orderStatus === 'CANCELLED' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B42318]/10 text-[#B42318]">
                    PAYMENT FAILED
                  </span>
                ) : (
                  getPaymentStatusBadge(order.paymentStatus)
                )
              )}
            </div>
            {!isOrderExpired && (order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED') && (
              <button
                onClick={() => navigate(`/orders/${order.orderId}/receipt`)}
                className="mt-2 inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-bold rounded shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Receipt
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Order Timeline */}
          {order && (
            <OrderTimeline
              statusHistory={order.statusHistory || []}
              currentStatus={order.orderStatus}
              isExpired={isOrderExpired}
            />
          )}

          {/* Shipment Information */}
          {order.shipments !== undefined && (
            <ShipmentInformation shipments={order.shipments} />
          )}

          {/* Refund Policy Status Alert */}
          {hasApprovedRefunds ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-sm flex items-start gap-3 shadow-sm">
              <span className="text-xl">🎉</span>
              <div>
                <p className="font-bold text-emerald-900">Refund Approved</p>
                <p className="text-xs mt-1 text-emerald-800 leading-relaxed">
                  The refund request for this order has been approved by our team.
                </p>
              </div>
            </div>
          ) : (refundableItems.length === 0 && hasRejectedRefunds) ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-lg text-sm flex items-start gap-3 shadow-sm">
              <span className="text-xl">❌</span>
              <div className="space-y-1">
                <p className="font-bold text-red-900">Refund Request Rejected</p>
                <p className="text-xs text-red-800 leading-relaxed">
                  The refund request for this order was rejected by administration. No further refund requests can be submitted.
                </p>
                {rejectedRemarks.length > 0 && (
                  <div className="mt-2 text-xs text-red-900 bg-white/90 p-2.5 rounded-md border border-red-200 shadow-xs">
                    <span className="font-semibold text-red-900">Rejection Reason: </span>
                    <ul className="mt-1 list-disc list-inside space-y-0.5">
                      {rejectedRemarks.map((rem, idx) => (
                        <li key={idx} className="font-medium text-red-800">{rem}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (refundableItems.length === 0 && hasPendingRefunds) ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm flex items-start gap-3 shadow-sm">
              <span className="text-xl">⏳</span>
              <div>
                <p className="font-bold text-amber-900">Refund Under Review</p>
                <p className="text-xs mt-1 text-amber-800 leading-relaxed">
                  The refund request for this order is currently being reviewed by our team.
                </p>
              </div>
            </div>
          ) : !deliveryInfo.isDelivered ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm flex items-start gap-3 shadow-sm">
              <span className="text-xl">📦</span>
              <div>
                <p className="font-bold text-amber-900">Refund Not Eligible Yet</p>
                <p className="text-xs mt-1 text-amber-800 leading-relaxed">
                  This order has not been delivered yet. Refunds can only be requested within 7 days after delivery.
                </p>
              </div>
            </div>
          ) : deliveryInfo.isExpired ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-lg text-sm flex items-start gap-3 shadow-sm">
              <span className="text-xl">⏰</span>
              <div>
                <p className="font-bold text-red-900">Refund Window Expired</p>
                <p className="text-xs mt-1 text-red-800 leading-relaxed">
                  The 7-day refund window from the delivery date has expired. Refunds can no longer be requested for this order.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-sm flex items-start gap-3 shadow-sm">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-bold text-emerald-900">Eligible for Refund ({deliveryInfo.daysRemaining} day{deliveryInfo.daysRemaining > 1 ? 's' : ''} remaining)</p>
                <p className="text-xs mt-1 text-emerald-800 leading-relaxed">
                  You can request a refund for the eligible items below within 7 days of delivery.
                </p>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden">
            <div className="px-4 py-4 sm:px-6 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-main">Order Items</h3>
              {canRequestRefund && (
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF2D55] hover:bg-[#E11D48] text-white text-xs sm:text-sm font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                  Request Refund
                </button>
              )}
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <OrderItemRow 
                    key={item.orderItemId} 
                    item={item} 
                    eligibility={eligibilities[item.orderItemId]}
                    existingRefund={myRefunds.find(r => r.orderItemId === item.orderItemId)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Shipping Address Section */}
            <div className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-border-subtle">
                <h3 className="text-lg font-bold text-text-main">Shipping Address</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 text-sm text-text-main space-y-1">
                {order.shippingAddress ? (
                  <>
                    <p className="font-bold text-base mb-2">{order.shippingAddress.recipientName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.township}, {order.shippingAddress.city}</p>
                    {order.shippingAddress.regionOrState && <p>{order.shippingAddress.regionOrState}</p>}
                    <p className="mt-2 text-text-muted">Phone: <span className="text-text-main">{order.shippingAddress.phoneNumber}</span></p>
                  </>
                ) : (
                  <p className="text-text-muted italic">No shipping address provided.</p>
                )}
              </div>
            </div>

            {/* Payment Info Section */}
            <div className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-border-subtle">
                <h3 className="text-lg font-bold text-text-main">Payment Information</h3>
              </div>
              <div className="px-4 py-5 sm:p-6 text-sm text-text-main space-y-3">
                {order.payment ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Method:</span>
                      <span className="font-medium">
                        {order.orderStatus === 'CANCELLED' || isOrderExpired || (order.payment.paymentStatus !== 'SUCCESS' && order.payment.paymentStatus !== 'PARTIALLY_REFUNDED' && order.payment.paymentStatus !== 'REFUNDED')
                          ? 'N/A'
                          : formatPaymentMethod(order.payment.paymentMethod)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Status:</span>
                      <span className={`font-medium ${isOrderExpired || order.orderStatus === 'CANCELLED' ? 'text-[#B42318] font-bold' : ''}`}>
                        {isOrderExpired
                          ? 'ORDER EXPIRED'
                          : order.orderStatus === 'CANCELLED'
                          ? 'PAYMENT FAILED'
                          : order.payment.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Amount:</span>
                      <span className="font-medium">{formatPrice(order.payment.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Reference:</span>
                      <span className="font-mono text-xs">{order.payment.transactionRef}</span>
                    </div>
                    {order.payment.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Paid At:</span>
                        <span className="font-medium">{formatDateTime(order.payment.paidAt)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <svg className="w-10 h-10 text-text-muted mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <p className="text-text-muted italic">No payment attempt yet.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Order Summary Section */}
          <div className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:ml-auto sm:w-1/2 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-medium text-text-main">{formatPrice(order.subtotalAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-[#B42318]">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Tax</span>
                  <span className="font-medium text-text-main">{formatPrice(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping Fee</span>
                  <span className="font-medium text-text-main">{formatPrice(order.shippingFee)}</span>
                </div>
                <div className="pt-4 border-t border-border-subtle flex justify-between">
                  <span className="font-bold text-base text-text-main">Total Amount</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Global Request Refund Modal for Order Items */}
      <RequestRefundModal
        items={refundableItems}
        deliveryInfo={{
          isDelivered: deliveryInfo.isDelivered,
          isExpired: deliveryInfo.isExpired,
          ineligibleReason: deliveryInfo.ineligibleReason,
        }}
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onSuccess={() => {
          fetchOrderAndRefunds();
        }}
      />
    </div>
  );
};
