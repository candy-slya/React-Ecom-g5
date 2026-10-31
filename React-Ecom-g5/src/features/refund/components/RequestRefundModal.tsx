import React, { useState, useEffect } from 'react';
import type { RefundReason } from '../types';
import { refundApi } from '../api/refundApi';

export interface RefundableItemData {
  orderItemId: number;
  productName: string;
  variantAttributes?: string;
  orderedQuantity: number;
  remainingRefundableQuantity: number;
}

interface RequestRefundModalProps {
  items: RefundableItemData[];
  deliveryInfo?: {
    isDelivered: boolean;
    isExpired: boolean;
    ineligibleReason?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_LABELS: Record<RefundReason, string> = {
  DAMAGED_ITEM: 'Damaged Item',
  DEFECTIVE_PRODUCT: 'Defective Product',
  MISSING_PARTS: 'Missing Parts',
  ORDERED_BY_MISTAKE: 'Ordered by Mistake',
  WRONG_ITEM_SENT: 'Wrong Item Sent',
  OTHER: 'Other',
};

interface ItemFormState {
  orderItemId: number;
  productName: string;
  variantAttributes?: string;
  orderedQuantity: number;
  remainingRefundableQuantity: number;
  refundQuantity: number;
  selected: boolean;
}

export const RequestRefundModal: React.FC<RequestRefundModalProps> = ({
  items,
  deliveryInfo,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [itemStates, setItemStates] = useState<ItemFormState[]>([]);
  const [reason, setReason] = useState<RefundReason>('DAMAGED_ITEM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      setItemStates(
        items.map((item) => ({
          orderItemId: item.orderItemId,
          productName: item.productName,
          variantAttributes: item.variantAttributes,
          orderedQuantity: item.orderedQuantity,
          remainingRefundableQuantity: item.remainingRefundableQuantity,
          refundQuantity: Math.min(1, item.remainingRefundableQuantity),
          selected: true,
        }))
      );
      setReason('DAMAGED_ITEM');
      setError(null);
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const isBlocked = deliveryInfo ? (!deliveryInfo.isDelivered || deliveryInfo.isExpired) : false;
  const blockedMessage = deliveryInfo?.ineligibleReason || 
    (!deliveryInfo?.isDelivered 
      ? 'Delivered ပြီးမှသာ Refund တောင်းဆိုနိုင်ပါသည်။ (Order must be delivered before refund)' 
      : 'Refund တောင်းဆိုနိုင်သည့် ကာလ (၇ ရက်) ကျော်လွန်သွားပါပြီ။ (Refund period of 7 days has expired)');

  const selectedItems = itemStates.filter((it) => it.selected);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      setError(blockedMessage);
      return;
    }

    if (selectedItems.length === 0) {
      setError('Please select at least one item to refund.');
      return;
    }

    for (const it of selectedItems) {
      if (it.refundQuantity < 1 || it.refundQuantity > it.remainingRefundableQuantity) {
        setError(`Invalid refund quantity for ${it.productName}. Maximum allowed is ${it.remainingRefundableQuantity}.`);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    try {
      // Submit refund requests for all selected items together
      await Promise.all(
        selectedItems.map((it) =>
          refundApi.createRefundRequest({
            orderItemId: it.orderItemId,
            refundQuantity: it.refundQuantity,
            requestReason: reason,
          })
        )
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit refund request.');
    } finally {
      setLoading(false);
    }
  };

  const isSingleItem = itemStates.length === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Request Refund</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Refund Policy Alert Box */}
          <div className="p-3.5 bg-[#FFF0F2] text-xs border border-[#FFD1D8] rounded-lg leading-relaxed">
            <span className="font-semibold text-[#FF2D55]">Refund Policy: </span>
            <span className="text-gray-600">
              Refunds can only be requested after the order has been delivered, and must be submitted within 7 days of delivery.
            </span>
          </div>

          {isBlocked && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 font-medium">
              ⛔ {blockedMessage}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Single Item Layout (Identical to reference screenshot) */}
          {isSingleItem && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Product</p>
                <p className="text-gray-900 font-semibold text-base">
                  {itemStates[0].productName}
                  {itemStates[0].variantAttributes && itemStates[0].variantAttributes !== '{}' && (
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      ({Object.entries(JSON.parse(itemStates[0].variantAttributes)).map(([k, v]) => `${k}: ${v}`).join(', ')})
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Ordered</p>
                  <p className="text-gray-900 text-base">{itemStates[0].orderedQuantity}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Refundable</p>
                  <p className="text-gray-900 text-base">{itemStates[0].remainingRefundableQuantity}</p>
                </div>
              </div>

              <div>
                <label htmlFor="refundQty" className="block text-sm font-medium text-gray-800 mb-1.5">
                  Refund Quantity
                </label>
                <input
                  id="refundQty"
                  type="number"
                  min="1"
                  max={itemStates[0].remainingRefundableQuantity}
                  value={itemStates[0].refundQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setItemStates([{
                      ...itemStates[0],
                      refundQuantity: Math.max(1, Math.min(val, itemStates[0].remainingRefundableQuantity)),
                    }]);
                  }}
                  required
                  disabled={loading || isBlocked}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FF2D55] focus:border-[#FF2D55] disabled:opacity-50 text-base"
                />
              </div>
            </div>
          )}

          {/* Multiple Items Layout (Select which items and quantities to refund all at once) */}
          {!isSingleItem && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-800">Select Items to Refund</p>
                <span className="text-xs text-gray-500">
                  {selectedItems.length} of {itemStates.length} selected
                </span>
              </div>
              
              <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
                {itemStates.map((it, idx) => (
                  <div 
                    key={it.orderItemId}
                    className={`p-3 rounded-lg border transition-all ${
                      it.selected 
                        ? 'border-[#FF2D55]/50 bg-[#FFF0F2]/25 shadow-xs' 
                        : 'border-gray-200 bg-gray-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <label className="flex items-start gap-2.5 cursor-pointer flex-1 select-none">
                        <input
                          type="checkbox"
                          checked={it.selected}
                          onChange={(e) => {
                            const updated = [...itemStates];
                            updated[idx].selected = e.target.checked;
                            setItemStates(updated);
                          }}
                          className="mt-1 w-4 h-4 text-[#FF2D55] rounded accent-[#FF2D55] cursor-pointer"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-snug">{it.productName}</p>
                          {it.variantAttributes && it.variantAttributes !== '{}' && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {Object.entries(JSON.parse(it.variantAttributes)).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </p>
                          )}
                          <div className="flex gap-4 text-xs text-gray-600 mt-1">
                            <span>Ordered: <strong className="text-gray-900">{it.orderedQuantity}</strong></span>
                            <span>Refundable: <strong className="text-gray-900">{it.remainingRefundableQuantity}</strong></span>
                          </div>
                        </div>
                      </label>

                      <div className="w-24 shrink-0">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Refund Qty</label>
                        <input
                          type="number"
                          min="1"
                          max={it.remainingRefundableQuantity}
                          value={it.refundQuantity}
                          disabled={!it.selected || loading || isBlocked}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            const updated = [...itemStates];
                            updated[idx].refundQuantity = Math.max(1, Math.min(val, it.remainingRefundableQuantity));
                            setItemStates(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF2D55] focus:border-[#FF2D55] disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reason Select */}
          <div>
            <label htmlFor="refundReason" className="block text-sm font-medium text-gray-800 mb-1.5">
              Reason
            </label>
            <select
              id="refundReason"
              value={reason}
              onChange={(e) => setReason(e.target.value as RefundReason)}
              required
              disabled={loading || isBlocked}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF2D55] focus:border-[#FF2D55] disabled:opacity-50 text-sm"
            >
              {(Object.keys(REASON_LABELS) as RefundReason[]).map((r) => (
                <option key={r} value={r}>
                  {REASON_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isBlocked || selectedItems.length === 0}
              className="px-5 py-2.5 bg-[#FF2D55] hover:bg-[#E11D48] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : isBlocked ? 'Refund Blocked' : 'Submit Request'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
