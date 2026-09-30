import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import type { OrderResponse } from '../../checkout/types';
import { orderApi } from '../../order/api/orderApi';
import { paymentApi } from '../api/paymentApi';
import type { PaymentDetailResponse } from '../api/paymentApi';
import { isAxiosError } from 'axios';

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize order state with navigation state if available (for immediate display)
  const navOrder = location.state?.order as OrderResponse | undefined;
  const initialOrder = (navOrder && String(navOrder.orderId) === orderId) ? navOrder : null;

  const [order, setOrder] = useState<OrderResponse | null>(initialOrder);
  const [latestPayment, setLatestPayment] = useState<PaymentDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialOrder);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [initiationError, setInitiationError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || isNaN(Number(orderId))) {
      setError('Invalid order ID.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const fetchedOrder = await orderApi.getOrderById(orderId);
        setOrder(fetchedOrder);
        
        try {
          const fetchedPayment = await paymentApi.getLatestPayment(orderId);
          // Handle 204 No Content (axios might return empty string or null)
          setLatestPayment(fetchedPayment ? fetchedPayment : null);
        } catch (paymentErr) {
          if (isAxiosError(paymentErr) && (paymentErr.response?.status === 404 || paymentErr.response?.status === 204)) {
            // No payment exists yet, normal unpaid state
            setLatestPayment(null);
          } else {
            // Unexpected failure, log it but don't fail the page entirely
            console.error('Failed to load latest payment details', paymentErr);
          }
        }

      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          setError('Payment information is unavailable. Please return to checkout or orders page.');
        } else {
          setError('Failed to retrieve order details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleProceedToPayment = async () => {
    if (!orderId || isSubmitting) return;

    setIsSubmitting(true);
    setInitiationError(null);

    try {
      const response = await paymentApi.initiatePayment(Number(orderId), 'MINI_BANKING');
      
      if (!response.redirectUrl || response.redirectUrl.trim() === '') {
        setInitiationError('Invalid redirect URL received from payment gateway.');
        setIsSubmitting(false);
        return;
      }
      
      // Full browser redirect. This enforces the external gateway boundary.
      window.location.href = response.redirectUrl;
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setInitiationError(err.response.data.message);
      } else {
        setInitiationError('Failed to initiate payment. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-page py-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-text-secondary text-lg">Loading payment details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-page py-16 px-4 min-h-screen">
        <div className="mx-auto max-w-2xl rounded-lg border border-[#B42318]/20 bg-surface p-10 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-[#B42318]">Payment Information Unavailable</h2>
          <p className="mb-8 text-text-main">{error || 'We cannot retrieve the payment details for this order.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center justify-center rounded-md bg-[#FFFF00] text-[#000000] px-6 py-3 text-base font-bold shadow-sm hover:bg-[#F0EE00] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' MMK';
  };
  
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US');
  };

  const formatPaymentMethod = (method: string) => {
    if (method === 'MINI_BANKING') return 'Mini Banking';
    return method;
  };

  return (
    <div className="bg-page py-16 px-4 min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-text-main sm:text-4xl text-center">
          Complete Payment
        </h1>

        <div className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="space-y-6">
              
              <div className="border-b border-border-subtle pb-6">
                <p className="text-sm font-medium text-text-muted mb-1">Order Number</p>
                <p className="text-xl font-bold text-text-main">{order.orderNo}</p>
              </div>

              {order.paymentStatus === 'SUCCESS' && latestPayment?.paymentStatus === 'SUCCESS' ? (
                <>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Payment Status</p>
                    <p className="text-xl font-bold text-green-600">SUCCESS</p>
                  </div>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Amount Paid</p>
                    <p className="text-xl font-bold text-text-main">{formatPrice(latestPayment.amount)}</p>
                  </div>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Payment Method</p>
                    <p className="text-xl font-bold text-text-main">{formatPaymentMethod(latestPayment.paymentMethod)}</p>
                  </div>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Transaction Reference</p>
                    <p className="text-sm font-mono break-all text-text-main">{latestPayment.transactionRef || 'N/A'}</p>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-text-muted mb-1">Paid At</p>
                    <p className="text-base text-text-main">{formatDateTime(latestPayment.paidAt)}</p>
                  </div>
                  
                  <div className="pt-4 text-center mt-4 border-t border-gray-100 pt-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful</h3>
                    <p className="text-sm text-gray-500 mb-6">Your order has been paid successfully.</p>
                    <button
                      onClick={() => navigate(`/orders/${orderId}/receipt`)}
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-[#FFFF00] text-[#000000] font-bold rounded shadow-sm hover:bg-[#F0EE00] transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Receipt
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Amount Due</p>
                    <p className="text-3xl font-bold text-text-main">{formatPrice(order.totalAmount)}</p>
                  </div>

                  <div className="pb-4">
                    <p className="text-sm font-medium text-text-muted mb-3">Payment Method</p>
                    <div className="rounded-md border-2 border-primary bg-primary/5 p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="font-bold text-text-main">Mini Banking</span>
                      </div>
                    </div>
                  </div>

                  {initiationError && (
                    <div className="rounded-md bg-[#FEF3F2] p-4 border border-[#FEE4E2]">
                      <p className="text-sm font-medium text-[#B42318]">{initiationError}</p>
                    </div>
                  )}

                  {order.paymentStatus === 'PENDING' && latestPayment?.paymentStatus === 'FAILED' && (
                    <div className="rounded-md bg-[#FEF3F2] p-4 border border-[#FEE4E2] mb-4 text-center">
                      <h3 className="text-lg font-bold text-[#B42318] mb-1">Payment Failed</h3>
                      <p className="text-sm text-[#B42318]">Your payment was not completed. You can try again.</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={isSubmitting}
                      className="w-full rounded-md bg-[#FFFF00] text-[#000000] px-4 py-4 text-base font-bold shadow-sm transition-colors hover:bg-[#F0EE00] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : (latestPayment?.paymentStatus === 'FAILED' ? 'Try Again' : 'Proceed to Payment')}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
