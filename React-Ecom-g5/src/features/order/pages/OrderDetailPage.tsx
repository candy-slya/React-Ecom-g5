import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import type { OrderDetailResponse } from '../types';
import { formatPrice, formatDateTime } from '../../../utils/formatters';
import { getOrderStatusBadge, getPaymentStatusBadge } from '../../../utils/statusBadges';
import { OrderTimeline } from '../components/OrderTimeline';
import { ShipmentInformation } from '../components/ShipmentInformation';
import { refundApi } from '../../refund/api/refundApi';
import type { RefundEligibilityDto } from '../../refund/types';
import { RequestRefundModal } from '../../refund/components/RequestRefundModal';

const OrderItemRow: React.FC<{ item: any, orderPaymentStatus: string }> = ({ item, orderPaymentStatus }) => {
  const [eligibility, setEligibility] = useState<RefundEligibilityDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchEligibility = async () => {
    if (orderPaymentStatus !== 'SUCCESS') return; // only fetch if eligible
    setLoading(true);
    try {
      const data = await refundApi.getRefundEligibility(item.orderItemId);
      setEligibility(data);
    } catch (e) {
      // fail safely
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibility();
  }, [item.orderItemId, orderPaymentStatus]);

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
        {!loading && eligibility && (
          <div className="mt-2 text-sm">
            {eligibility.alreadyReservedRefundQuantity > 0 && (
              <span className="text-[#B7791F] mr-3">
                Refund Requested: {eligibility.alreadyReservedRefundQuantity}
              </span>
            )}
            {eligibility.canRequestRefund && (
              <button 
                onClick={() => setModalOpen(true)}
                className="text-primary hover:text-primary-hover font-medium underline underline-offset-2 transition-colors"
              >
                Request Refund ({eligibility.remainingRefundableQuantity} available)
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="sm:text-right mt-2 sm:mt-0 flex flex-col justify-end">
        {item.discountAmount > 0 && (
          <p className="text-sm text-[#B42318] mb-1">
            Discount: -{formatPrice(item.discountAmount)}
          </p>
        )}
        <p className="font-bold text-text-main">{formatPrice(item.subtotal)}</p>
      </div>

      {eligibility && (
        <RequestRefundModal
          orderItemId={item.orderItemId}
          productName={item.productName}
          orderedQuantity={item.qty}
          remainingRefundableQuantity={eligibility.remainingRefundableQuantity}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            fetchEligibility();
          }}
        />
      )}
    </div>
  );
};

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!orderId) throw new Error("Order ID is missing");
        
        // This will call the upgraded GET /v1/orders/{orderId} returning OrderDetailResponse
        const data = await orderApi.getOrderById(orderId);
        setOrder(data as unknown as OrderDetailResponse);
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

    fetchOrder();
  }, [orderId]);

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
              onClick={() => navigate('/orders')}
              className="rounded-md border border-border-subtle bg-surface px-6 py-2 text-text-main font-bold hover:bg-page transition-colors"
            >
              Back to Orders
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-[#FFFF00] text-[#000000] px-6 py-2 font-bold hover:bg-[#F0EE00] transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-page min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate('/orders')}
              className="text-text-muted hover:text-primary transition-colors flex items-center mb-4 text-sm font-medium"
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
              {getOrderStatusBadge(order.orderStatus)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-text-muted">Payment:</span>
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
            {(order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED') && (
              <button
                onClick={() => navigate(`/orders/${order.orderId}/receipt`)}
                className="mt-2 inline-flex items-center px-4 py-2 bg-[#FFFF00] text-[#000000] text-sm font-bold rounded shadow-sm hover:bg-[#F0EE00] transition-colors"
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
          {order.statusHistory && (
            <OrderTimeline statusHistory={order.statusHistory} />
          )}

          {/* Shipment Information */}
          {order.shipments !== undefined && (
            <ShipmentInformation shipments={order.shipments} />
          )}

          {/* Items Section */}
          <div className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-border-subtle">
              <h3 className="text-lg font-bold text-text-main">Order Items</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <OrderItemRow key={item.orderItemId} item={item} orderPaymentStatus={order.paymentStatus} />
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
                      <span className="font-medium">{order.payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Status:</span>
                      <span className="font-medium">{order.payment.paymentStatus}</span>
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
    </div>
  );
};
