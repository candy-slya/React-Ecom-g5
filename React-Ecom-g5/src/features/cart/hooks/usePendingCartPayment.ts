import { useState, useEffect, useCallback, useRef } from 'react';
import { isAxiosError } from 'axios';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { pendingCartOrderStorage, PENDING_CART_ORDER_EVENT } from '../utils/pendingCartOrderStorage';
import type { PendingCartOrder } from '../utils/pendingCartOrderStorage';
import { orderApi } from '../../order/api/orderApi';
import { fetchAuthenticatedCart } from '../store/cartSlice';

export interface UsePendingCartPaymentResult {
  isPending: boolean;
  pendingOrder: PendingCartOrder | null;
  refreshStatus: () => Promise<void>;
}

export const usePendingCartPayment = (): UsePendingCartPaymentResult => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, customer } = useAppSelector((state) => state.auth);

  const [pendingOrder, setPendingOrder] = useState<PendingCartOrder | null>(() => {
    return isAuthenticated && customer?.customerId
      ? pendingCartOrderStorage.get(customer.customerId)
      : null;
  });

  const [isPending, setIsPending] = useState<boolean>(() => {
    return Boolean(pendingOrder);
  });

  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Sync state whenever storage changes (same tab or cross-tab)
  const syncMarker = useCallback(() => {
    if (!isAuthenticated || !customer?.customerId) {
      setPendingOrder(null);
      setIsPending(false);
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      return;
    }

    const current = pendingCartOrderStorage.get(customer.customerId);
    setPendingOrder(current);
    if (!current) {
      setIsPending(false);
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    } else {
      setIsPending(true);
    }
  }, [isAuthenticated, customer?.customerId]);

  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'g5_pending_cart_order' || e.key === null) {
        syncMarker();
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(PENDING_CART_ORDER_EVENT, syncMarker);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(PENDING_CART_ORDER_EVENT, syncMarker);
    };
  }, [syncMarker]);

  const checkStatus = useCallback(async () => {
    if (!isAuthenticated || !customer?.customerId) {
      setIsPending(false);
      return;
    }

    const currentMarker = pendingCartOrderStorage.get(customer.customerId);
    if (!currentMarker) {
      setIsPending(false);
      return;
    }

    try {
      const order = await orderApi.getOrderById(currentMarker.orderId);

      if (!isMountedRef.current) return;

      const pStatus = (order.paymentStatus || '').toUpperCase();
      const oStatus = (order.orderStatus || '').toUpperCase();

      // Terminal Success
      if (pStatus === 'SUCCESS' || oStatus === 'PAID') {
        pendingCartOrderStorage.clear();
        setIsPending(false);
        setPendingOrder(null);
        dispatch(fetchAuthenticatedCart());
        return;
      }

      // Terminal Failure / Cancel
      if (
        pStatus === 'FAILED' ||
        pStatus === 'CANCELLED' ||
        pStatus === 'REFUNDED' ||
        oStatus === 'CANCELLED'
      ) {
        pendingCartOrderStorage.clear();
        setIsPending(false);
        setPendingOrder(null);
        return;
      }

      // Still unresolved (PENDING / PROCESSING)
      setIsPending(true);
      pollingTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          checkStatus();
        }
      }, 3000);
    } catch (err) {
      // Terminal 404 / 403: Resource does not exist or unauthorized customer
      if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 403)) {
        console.warn(`Pending cart order is inaccessible or deleted (HTTP ${err.response.status}). Clearing stale marker.`);
        pendingCartOrderStorage.clear();
        if (!isMountedRef.current) return;
        setIsPending(false);
        setPendingOrder(null);
        return;
      }

      // Fail-closed on other errors (HTTP 401, 500, network/timeout): keep locked and retry in 5s
      console.warn('Unable to verify pending payment status, retrying in 5s', err);
      if (!isMountedRef.current) return;
      setIsPending(true);
      pollingTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          checkStatus();
        }
      }, 5000);
    }
  }, [isAuthenticated, customer?.customerId, dispatch]);

  useEffect(() => {
    isMountedRef.current = true;

    if (isAuthenticated && customer?.customerId && pendingOrder) {
      checkStatus();
    } else {
      setIsPending(false);
    }

    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [isAuthenticated, customer?.customerId, pendingOrder, checkStatus]);

  return {
    isPending: isAuthenticated && Boolean(customer?.customerId) && isPending,
    pendingOrder,
    refreshStatus: checkStatus,
  };
};
