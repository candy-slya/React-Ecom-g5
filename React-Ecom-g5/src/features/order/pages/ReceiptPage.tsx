import { BrandLogo } from '../../../components/common/BrandLogo';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import type { OrderDetailResponse } from '../types';
import { formatPrice, formatDateTime } from '../../../utils/formatters';
import { getPaymentStatusBadge } from '../../../utils/statusBadges';


const safeParseAttributes = (attrStr: string | null | undefined): Record<string, string> => {
  if (!attrStr || attrStr === '{}') return {};
  try {
    return JSON.parse(attrStr);
  } catch (e) {
    return { "Variant": attrStr }; 
  }
};

export const ReceiptPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) return;
        const data = await orderApi.getOrderById(Number(orderId));
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
      <div className="flex justify-center items-center min-h-[60vh] print:hidden">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] print:hidden space-y-4">
        <p className="text-[#B42318] text-lg">{error}</p>
        <button 
          onClick={() => navigate('/orders')}
          className="text-primary hover:underline"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  if (!order || (order.paymentStatus !== 'SUCCESS' && order.paymentStatus !== 'REFUNDED' && order.paymentStatus !== 'PARTIALLY_REFUNDED')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] print:hidden space-y-4">
        <div className="text-center p-8 bg-surface rounded-lg border border-border-subtle shadow-sm max-w-md w-full">
          <svg className="mx-auto h-12 w-12 text-border-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-text-main">Receipt Unavailable</h2>
          <p className="mt-2 text-text-muted">Receipt is not available for this order.</p>
          <button 
            onClick={() => navigate(`/orders/${orderId}`)}
            className="mt-6 w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
          >
            Back to Order Details
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-8 print:bg-white print:py-0 print:min-h-0 print:m-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">
        
        {/* Actions Bar (Hidden on Print) */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center print:hidden space-y-4 sm:space-y-0">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="text-text-muted hover:text-primary flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Order Details
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </button>
        </div>

        {/* Receipt Document */}
        <div className="bg-surface shadow-sm border border-border-subtle rounded-lg overflow-hidden print:shadow-none print:border-none print:w-full print:rounded-none">
          <div className="p-8 sm:p-10 print:p-0">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border-subtle pb-6 mb-6">
              <div>
                <BrandLogo className="transform scale-125 origin-left" />
                <p className="text-text-muted mt-1 text-sm">Customer Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-text-main">Order #{order.orderNo}</p>
                <p className="text-sm text-text-muted mt-1">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>

            {/* Billing & Payment Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 border-b border-border-subtle pb-8">
              
              {/* Shipping Information */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
                  Shipping Details
                </h3>
                {order.shippingAddress ? (
                  <div className="text-sm text-text-main space-y-1">
                    <p className="font-bold">{order.shippingAddress.recipientName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.township}, {order.shippingAddress.city}</p>
                    {order.shippingAddress.regionOrState && <p>{order.shippingAddress.regionOrState}</p>}
                    <p className="mt-2 text-text-muted">
                      Phone: <span className="text-text-main">{order.shippingAddress.phoneNumber}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted italic">No shipping details</p>
                )}
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
                  Payment Details
                </h3>
                {order.payment ? (
                  <div className="text-sm text-text-main space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Method:</span>
                      <span className="font-medium">{order.payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Status:</span>
                      <span>{getPaymentStatusBadge(order.payment.paymentStatus)}</span>
                    </div>
                    {order.payment.transactionRef && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Reference:</span>
                        <span className="font-medium">{order.payment.transactionRef}</span>
                      </div>
                    )}
                    {order.payment.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Date Paid:</span>
                        <span className="font-medium">{formatDateTime(order.payment.paidAt)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted italic">No payment details</p>
                )}
              </div>

            </div>

            {/* Line Items */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
                Purchased Items
              </h3>
              
              <div className="hidden sm:grid sm:grid-cols-12 text-sm font-medium text-text-muted border-b border-border-subtle pb-2 mb-4">
                <div className="sm:col-span-6">Item</div>
                <div className="sm:col-span-2 text-right">Qty</div>
                <div className="sm:col-span-2 text-right">Price</div>
                <div className="sm:col-span-2 text-right">Total</div>
              </div>

              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.orderItemId} className="flex flex-col sm:grid sm:grid-cols-12 sm:items-center py-2 border-b border-gray-100 last:border-0 last:pb-0">
                    
                    <div className="sm:col-span-6 mb-2 sm:mb-0">
                      <p className="font-medium text-text-main">{item.productName}</p>
                      {Object.keys(safeParseAttributes(item.variantAttributes)).length > 0 && (
                        <p className="text-xs text-text-muted mt-0.5">
                          {Object.entries(safeParseAttributes(item.variantAttributes)).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      <div className="sm:hidden text-xs text-text-muted mt-1">
                        Qty: {item.qty} &times; {formatPrice(item.unitPrice)}
                      </div>
                    </div>
                    
                    <div className="hidden sm:block sm:col-span-2 text-right text-sm text-text-main">
                      {item.qty}
                    </div>
                    
                    <div className="hidden sm:block sm:col-span-2 text-right text-sm text-text-main">
                      {formatPrice(item.unitPrice)}
                    </div>
                    
                    <div className="sm:col-span-2 text-right text-sm font-medium text-text-main flex justify-between sm:block">
                      <span className="sm:hidden text-text-muted font-normal">Subtotal:</span>
                      <div>
                        {item.discountAmount > 0 && (
                          <div className="text-xs text-[#B42318] mb-0.5 font-normal">
                            -{formatPrice(item.discountAmount)}
                          </div>
                        )}
                        <span>{formatPrice(item.subtotal)}</span>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-border-subtle pt-6 flex flex-col items-end">
              <div className="w-full sm:w-1/2 space-y-3 text-sm text-text-main">
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotalAmount)}</span>
                </div>
                
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-[#B42318]">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Tax</span>
                  <span className="font-medium">{formatPrice(order.taxAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping Fee</span>
                  <span className="font-medium">{formatPrice(order.shippingFee)}</span>
                </div>
                
                <div className="flex justify-between border-t border-border-subtle pt-3 mt-3">
                  <span className="font-bold text-base uppercase">Final Total</span>
                  <span className="font-bold text-lg">{formatPrice(order.totalAmount)}</span>
                </div>
                
              </div>
            </div>

            {/* Footer Message */}
            <div className="mt-12 text-center text-xs text-text-muted print:mt-8">
              <p>Thank you for shopping at 6Sync.</p>
              <p className="mt-1">If you have any questions, please contact our support.</p>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};
