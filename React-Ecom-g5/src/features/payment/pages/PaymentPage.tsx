import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import type { OrderResponse } from '../../checkout/types';
import { orderApi } from '../../order/api/orderApi';
import { paymentApi } from '../api/paymentApi';
import type { PaymentDetailResponse } from '../api/paymentApi';
import { isAxiosError } from 'axios';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { fetchAuthenticatedCart } from '../../cart/store/cartSlice';

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

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() => {
    if (!initialOrder?.reservationExpiresAt) return null;
    const diff = Math.floor((new Date(initialOrder.reservationExpiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (!order?.reservationExpiresAt) {
      setRemainingSeconds(null);
      return;
    }

    const calculateRemaining = () => {
      const expiryMs = new Date(order.reservationExpiresAt!).getTime();
      const diff = Math.floor((expiryMs - Date.now()) / 1000);
      return Math.max(0, diff);
    };

    setRemainingSeconds(calculateRemaining());

    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order?.reservationExpiresAt]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [initiationError, setInitiationError] = useState<string | null>(null);
  const [isWaitingForPayment, setIsWaitingForPayment] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const dispatch = useAppDispatch();

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
        
        if (
          fetchedOrder.orderStatus === 'CANCELLED' ||
          fetchedOrder.paymentStatus === 'FAILED' ||
          fetchedOrder.reservationActive === false
        ) {
          dispatch(fetchAuthenticatedCart());
        }

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
        } else if (
          currentOrder.orderStatus === 'CANCELLED' ||
          currentOrder.paymentStatus === 'CANCELLED' ||
          currentOrder.paymentStatus === 'FAILED' ||
          (currentOrder.reservationActive === false && currentOrder.paymentStatus !== 'SUCCESS' && currentOrder.orderStatus !== 'PAID')
        ) {
          setIsWaitingForPayment(false);
          const payment = await paymentApi.getLatestPayment(orderId);
          setLatestPayment(payment || null);
          dispatch(fetchAuthenticatedCart());
        }
      } catch (e) {
        console.warn('Polling order payment status...', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isWaitingForPayment, orderId, navigate, dispatch]);

  const isCartOrder = (order?.checkoutType || 'CART').toUpperCase() === 'CART';

  const isPaid =
    order?.paymentStatus === 'SUCCESS' ||
    order?.orderStatus === 'PAID' ||
    latestPayment?.paymentStatus === 'SUCCESS';

  const isTerminalFailed =
    !isPaid &&
    (latestPayment?.paymentStatus === 'FAILED' || (order?.paymentStatus === 'FAILED' && latestPayment?.paymentStatus !== 'CANCELLED' && latestPayment !== null));

  const isTerminalCancelled =
    !isPaid &&
    !isTerminalFailed &&
    (order?.orderStatus === 'CANCELLED' || latestPayment?.paymentStatus === 'CANCELLED');

  const isTerminalExpired =
    !isPaid &&
    !isTerminalFailed &&
    !isTerminalCancelled &&
    (order?.reservationActive === false || (remainingSeconds !== null && remainingSeconds <= 0));

  const isTerminalState = isTerminalFailed || isTerminalCancelled || isTerminalExpired;

  const isReservationActive =
    !isTerminalState &&
    !isPaid &&
    Boolean(order?.reservationExpiresAt);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProceedToPayment = async () => {
    if (!orderId || isSubmitting || isTerminalState) return;

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

  const handleCancelPayment = async () => {
    if (!orderId || isCancelling) return;
    setIsCancelling(true);
    try {
      await paymentApi.cancelPayment(orderId);
      const updatedOrder = await orderApi.getOrderById(orderId);
      setOrder(updatedOrder);
      const updatedPayment = await paymentApi.getLatestPayment(orderId);
      setLatestPayment(updatedPayment);
      setIsWaitingForPayment(false);
      dispatch(fetchAuthenticatedCart());
    } catch (err: any) {
      console.error('Failed to cancel payment:', err);
    } finally {
      setIsCancelling(false);
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

              {isPaid ? (
                <>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Payment Status</p>
                    <p className="text-xl font-bold text-green-600">SUCCESS</p>
                  </div>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Amount Paid</p>
                    <p className="text-xl font-bold text-text-main">{formatPrice(latestPayment?.amount ?? order.totalAmount)}</p>
                  </div>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Payment Method</p>
                    <p className="text-xl font-bold text-text-main">{latestPayment?.paymentMethod ? formatPaymentMethod(latestPayment.paymentMethod) : 'EKARAJ  BANK'}</p>
                  </div>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Transaction Reference</p>
                    <p className="text-sm font-mono break-all text-text-main">{latestPayment?.transactionRef || 'N/A'}</p>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-text-muted mb-1">Paid At</p>
                    <p className="text-base text-text-main">{latestPayment?.paidAt ? formatDateTime(latestPayment.paidAt) : (order.modifiedAt ? formatDateTime(order.modifiedAt) : formatDateTime(order.createdAt))}</p>
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
              ) : isTerminalState ? (
                <>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Payment Status</p>
                    <p className={`text-xl font-bold ${isTerminalCancelled ? 'text-slate-700' : 'text-rose-600'}`}>
                      {isTerminalFailed ? 'FAILED' : isTerminalCancelled ? 'CANCELLED' : 'ORDER EXPIRED'}
                    </p>
                  </div>
                  <div className="border-b border-border-subtle pb-6">
                    <p className="text-sm font-medium text-text-muted mb-1">Order Amount</p>
                    <p className="text-xl font-bold text-text-main">{formatPrice(order.totalAmount)}</p>
                  </div>

                  <div className="pt-4 text-center mt-4 border-t border-gray-100 pt-6">
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${isTerminalCancelled ? 'bg-slate-100' : 'bg-rose-100'}`}>
                      {isTerminalCancelled ? (
                        <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : isTerminalFailed ? (
                        <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {isTerminalFailed ? 'Payment Failed' : isTerminalCancelled ? 'Order Cancelled' : 'Order Expired'}
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      {isTerminalFailed
                        ? 'Your payment was not completed.'
                        : isTerminalCancelled
                        ? 'You cancelled the order before payment.'
                        : 'Your order has expired.'}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">Stock hold has been released.</p>
                    {isCartOrder && !isTerminalExpired ? (
                      <p className="text-sm font-semibold text-emerald-700 mb-6">
                        Your checkout items have been returned to your cart.
                      </p>
                    ) : isTerminalExpired ? (
                      <p className="text-sm text-slate-500 mb-6">
                        The items were not returned to your cart. Please start a new order if you still wish to purchase them.
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 mb-6">
                        Direct purchase was not completed.
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      {isCartOrder && !isTerminalExpired && (
                        <button
                          type="button"
                          onClick={() => navigate('/cart')}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded shadow-sm hover:bg-primary-hover transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          View Cart
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate('/orders')}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-border-subtle bg-white text-text-main font-bold rounded shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        Order History
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Active Order Expiry Banner */}
                  {isReservationActive && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="h-5 w-5 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="text-sm font-bold text-amber-900">Payment Pending</h3>
                            {remainingSeconds !== null && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-200 text-amber-900 shadow-sm">
                                Your order expires in {formatCountdown(remainingSeconds)}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                            Your order has been placed. Please complete your payment before the timer expires.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {isWaitingForPayment ? (
                    <div className="rounded-lg bg-sky-50 p-4 border border-sky-200 mb-4 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <h4 className="text-sm font-bold text-sky-900">Banking portal opened in a new tab</h4>
                      </div>
                      <p className="text-xs text-sky-700">
                        Please complete your payment in the bank tab. This page will automatically update once confirmed.
                      </p>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleProceedToPayment}
                        disabled={isSubmitting || isCancelling}
                        className="w-full rounded-md bg-primary text-white px-4 py-4 text-base font-bold shadow-md transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPayment}
                        disabled={isCancelling || isSubmitting}
                        className="w-full mt-3 rounded-md border border-slate-300 bg-white text-slate-700 px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCancelling ? 'Cancelling...' : 'Cancel Payment'}
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
