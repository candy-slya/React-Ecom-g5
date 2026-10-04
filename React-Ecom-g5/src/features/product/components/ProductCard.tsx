import React, { useState } from 'react';
import type { ProductListResponse } from '../types';
import { getAssetUrl } from '../../../utils/assetUtils';

interface ProductCardProps {
  product: ProductListResponse;
  onClick?: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US').format(price) + ' MMK';
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getAssetUrl(product.primaryImageUrl);
  const hasImage = Boolean(imageUrl) && !imageError;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`group relative flex flex-col overflow-hidden rounded-lg bg-surface shadow-sm transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2' : ''}`}
    >
      <div className="aspect-[4/5] w-full bg-page">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.productName}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted opacity-50">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col space-y-2 border-t border-border-subtle p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {product.brandName ? `${product.brandName} • ${product.categoryName}` : product.categoryName}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-text-main">
          {product.productName}
        </h3>
        <div className="mt-auto pt-2">
          {product.startingPrice !== null ? (
            <span className="text-base font-bold text-primary">
              {formatPrice(product.startingPrice)}
            </span>
          ) : (
            <span className="text-sm text-text-muted">Price unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
};
