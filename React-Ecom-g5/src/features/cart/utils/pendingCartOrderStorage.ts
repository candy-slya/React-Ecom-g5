export interface PendingCartOrder {
  orderId: number;
  orderNo?: string;
  checkoutType: 'CART';
  customerId?: number;
  createdAt: number;
}

const STORAGE_KEY = 'g5_pending_cart_order';
export const PENDING_CART_ORDER_EVENT = 'g5_pending_cart_order_change';

export const pendingCartOrderStorage = {
  get(currentCustomerId?: number): PendingCartOrder | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.orderId === 'number' &&
        parsed.checkoutType === 'CART'
      ) {
        // Customer scoping validation
        if (typeof parsed.customerId === 'number') {
          if (currentCustomerId !== undefined && parsed.customerId !== currentCustomerId) {
            return null; // Belongs to a different customer
          }
          return parsed as PendingCartOrder;
        }

        // Legacy marker without customerId:
        // If an authenticated customer ID is provided, treat unscoped legacy marker as stale and clear it
        if (currentCustomerId !== undefined) {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }

        return parsed as PendingCartOrder;
      }
      return null;
    } catch {
      return null;
    }
  },

  set(order: { orderId: number; orderNo?: string; checkoutType: 'CART'; customerId?: number }): void {
    try {
      const data: PendingCartOrder = {
        orderId: order.orderId,
        orderNo: order.orderNo,
        checkoutType: 'CART',
        customerId: order.customerId,
        createdAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event(PENDING_CART_ORDER_EVENT));
    } catch (e) {
      console.error('Failed to save pending cart order marker', e);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(PENDING_CART_ORDER_EVENT));
    } catch (e) {
      console.error('Failed to clear pending cart order marker', e);
    }
  },
};
