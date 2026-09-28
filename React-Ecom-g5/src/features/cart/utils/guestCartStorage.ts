import type { GuestCartItem } from '../types';
import { MAX_CART_ITEM_QUANTITY } from '../types';

const STORAGE_KEY = 'g5_guest_cart';

export const guestCartStorage = {
  load(): GuestCartItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        this.clear();
        return [];
      }

      const normalizedMap = new Map<number, number>();

      for (const item of parsed) {
        // Validate each item
        if (
          item &&
          typeof item === 'object' &&
          typeof item.variantId === 'number' &&
          Number.isSafeInteger(item.variantId) &&
          item.variantId > 0 &&
          typeof item.quantity === 'number' &&
          Number.isSafeInteger(item.quantity) &&
          item.quantity > 0 &&
          item.quantity <= MAX_CART_ITEM_QUANTITY
        ) {
          const existingQty = normalizedMap.get(item.variantId) || 0;
          const newQty = existingQty + item.quantity;
          
          if (newQty <= MAX_CART_ITEM_QUANTITY) {
            normalizedMap.set(item.variantId, newQty);
          }
          // If combining exceeds MAX_CART_ITEM_QUANTITY, do NOT apply the addition and preserve existingQty
        }
      }

      const result: GuestCartItem[] = [];
      normalizedMap.forEach((quantity, variantId) => {
        result.push({ variantId, quantity });
      });

      return result;
    } catch (error) {
      // JSON parse error or other issue
      this.clear();
      return [];
    }
  },

  save(items: GuestCartItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save guest cart', error);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear guest cart', error);
    }
  }
};
