import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CartItemResponse, GuestCartResolvedItemResponse } from '../types';
import { getAssetUrl } from '../../../utils/assetUtils';

interface CartItemProps {
  item: CartItemResponse | GuestCartResolvedItemResponse;
  isAuthenticated: boolean;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  isUpdating: boolean;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  isAuthenticated,
  onQuantityChange,
  onRemove,
  isUpdating,
}) => {
  const [imageError, setImageError] = useState(false);

  const identifierId = isAuthenticated 
    ? (item as CartItemResponse).cartItemId 
    : (item as GuestCartResolvedItemResponse).variantId;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      let targetQuantity = item.quantity - 1;
      
      if (!item.available && item.stockStatus === 'INSUFFICIENT_STOCK' && item.quantity > item.availableQuantity) {
        targetQuantity = Math.max(1, item.availableQuantity);
      }
      
      onQuantityChange(identifierId, targetQuantity);
    }
  };

  const handleIncrease = () => {
    if (!item.available) return;
    
    if (item.quantity < item.availableQuantity) {
      onQuantityChange(identifierId, item.quantity + 1);
    }
  };

  const handleRemove = () => {
    onRemove(identifierId);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' MMK';
  };

  const productName = item.productName || 'Item no longer available';
  const hasLink = item.productId != null;

  let statusMessage = null;
  if (!item.available) {
    if (item.stockStatus === 'UNAVAILABLE') {
      statusMessage = 'This item is no longer available.';
    } else if (item.stockStatus === 'OUT_OF_STOCK') {
      statusMessage = 'Currently out of stock.';
    } else if (item.stockStatus === 'INSUFFICIENT_STOCK') {
      statusMessage = `Only ${item.availableQuantity} currently available.`;
    } else {
      statusMessage = 'Item unavailable.';
    }
  }

  const renderImage = () => {
    const showPlaceholder = !item.imageUrl || imageError;

    if (showPlaceholder) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-surface text-text-muted">
          <svg className="h-8 w-8 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">No Image</span>
        </div>
      );
    }

    return (
      <img 
        src={getAssetUrl(item.imageUrl as string)} 
        alt={productName} 
        onError={() => setImageError(true)}
        className={`h-full w-full object-cover object-center ${!hasLink ? 'grayscale opacity-75' : ''}`} 
      />
    );
  };

  return (
    <div className="flex flex-col border-b border-border-subtle py-6 sm:flex-row sm:items-start">
      {/* Image */}
      <div className="mb-4 h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border-subtle bg-surface sm:mb-0 sm:h-32 sm:w-32">
        {hasLink ? (
          <Link to={`/products/${item.productId}`} className="block h-full w-full">
            {renderImage()}
          </Link>
        ) : (
          renderImage()
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col sm:ml-6">
        <div className="flex justify-between">
          <div className="flex-1">
            <h4 className="text-base font-bold text-text-main">
              {hasLink ? (
                <Link to={`/products/${item.productId}`} className="hover:text-primary transition-colors">
                  {productName}
                </Link>
              ) : (
                <span className="text-text-muted">{productName}</span>
              )}
            </h4>
            
            {item.sku && (
              <p className="mt-1 text-sm text-text-muted">SKU: {item.sku}</p>
            )}

            {/* Options */}
            {item.options && Object.keys(item.options).length > 0 && (
              <ul className="mt-2 text-sm text-text-muted space-y-1">
                {Object.entries(item.options).map(([key, value]) => (
                  <li key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </li>
                ))}
              </ul>
            )}

            {/* Status Message */}
            {statusMessage && (
              <p className="mt-2 text-sm font-medium text-[#B42318]">
                {statusMessage}
              </p>
            )}
          </div>

          <div className="ml-4 text-right">
            <p className="text-base font-bold text-text-main">{formatPrice(item.effectivePrice)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-1 items-end justify-between sm:mt-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center rounded-md border border-border-subtle bg-surface px-2 py-1">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={item.quantity <= 1 || isUpdating}
                className="text-text-muted hover:text-primary focus:outline-none disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="mx-3 text-sm font-medium text-text-main">{item.quantity}</span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={!item.available || item.quantity >= item.availableQuantity || isUpdating}
                className="text-text-muted hover:text-primary focus:outline-none disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUpdating}
              className="text-sm font-medium text-[#B42318] hover:text-[#911d13] transition-colors focus:outline-none disabled:opacity-50"
            >
              Remove
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-text-main">
              Subtotal: <span className="font-bold">{formatPrice(item.subtotal)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
