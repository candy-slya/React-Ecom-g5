import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import type { OrderResponse } from '../../checkout/types';
import { orderApi } from '../../order/api/orderApi';
import { paymentApi } from '../api/paymentApi';
import type { PaymentDetailResponse } from '../api/paymentApi';
import { isAxiosError } from 'axios';
import { pendingCartOrderStorage } from '../../cart/utils/pendingCartOrderStorage';

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
  const [isWaitingForPayment, setIsWaitingForPayment] = useState<boolean>(false);

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
        if (fetchedOrder.paymentStatus === 'SUCCESS' || fetchedOrder.orderStatus === 'PAID') {
          pendingCartOrderStorage.clear();
        }
        
        try {
          const fetchedPayment = await paymentApi.getLatestPayment(orderId);
          // Handle 204 No Content (axios might return empty string or null)
          setLatestPayment(fetchedPayment ? fetchedPayment : null);
          if (fetchedPayment?.paymentStatus === 'SUCCESS') {
            pendingCartOrderStorage.clear();
          }
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

  // Polling hook: Automatically detects when G3 completes webhook delivery to G5
  useEffect(() => {
    if (!isWaitingForPayment || !orderId) return;

    const interval = setInterval(async () => {
      try {
        const currentOrder = await orderApi.getOrderById(orderId);
        setOrder(currentOrder);
        if (currentOrder.paymentStatus === 'SUCCESS' || currentOrder.orderStatus === 'PAID') {
          clearInterval(interval);
          navigate(`/orders/${orderId}/receipt`);
        } else if (currentOrder.paymentStatus === 'FAILED') {
          setIsWaitingForPayment(false);
          const payment = await paymentApi.getLatestPayment(orderId);
          setLatestPayment(payment || null);
        }
      } catch (e) {
        console.warn('Polling order payment status...', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isWaitingForPayment, orderId, navigate]);

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
      
      // Open G1 Banking Portal in a NEW TAB / WINDOW
      window.open(response.redirectUrl, '_blank');
      setIsWaitingForPayment(true);
      setIsSubmitting(false);
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
            className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-base font-bold shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
    if (method === 'MINI_BANKING') return 'EKARAJ BANK';
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
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-white font-bold rounded shadow-sm hover:bg-primary-hover transition-colors"
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
                        <span className="font-bold text-text-main">EKARAJ  BANK</span>
                      </div>
                    </div>
                  </div>

                  {initiationError && (
                    <div className="rounded-md bg-[#FEF3F2] p-4 border border-[#FEE4E2]">
                      <p className="text-sm font-medium text-[#B42318]">{initiationError}</p>
                    </div>
                  )}

                  {(order.paymentStatus === 'FAILED' || order.paymentStatus === 'PENDING') && latestPayment?.paymentStatus === 'FAILED' && (
                    <div className="rounded-md bg-[#FEF3F2] p-4 border border-[#FEE4E2] mb-4 text-center">
                      <h3 className="text-lg font-bold text-[#B42318] mb-1">Payment Failed</h3>
                      <p className="text-sm text-[#B42318]">Your payment was not completed. You can try again.</p>
                    </div>
                  )}

                  {isWaitingForPayment && (
                    <div className="rounded-lg bg-sky-50 p-4 border border-sky-200 mb-4 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <h4 className="text-sm font-bold text-sky-900">Banking portal opened in a new tab</h4>
                      </div>
                      <p className="text-xs text-sky-700 mb-3">
                        Please complete your payment in the bank tab. This page will automatically update once confirmed.
                      </p>
                      <button
                        type="button"
                        onClick={handleProceedToPayment}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Did the tab not open? Click here to reopen
                      </button>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={isSubmitting}
                      className="w-full rounded-md bg-primary text-white px-4 py-4 text-base font-bold shadow-md transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : (isWaitingForPayment ? 'Reopen Payment Window' : (latestPayment?.paymentStatus === 'FAILED' ? 'Try Again' : 'Proceed to Payment'))}
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
