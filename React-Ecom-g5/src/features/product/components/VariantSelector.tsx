import React from 'react';
import type { ProductVariantResponse } from '../types';

interface VariantSelectorProps {
  variants: ProductVariantResponse[];
  selectedVariantId: number | null;
  onVariantChange: (variant: ProductVariantResponse) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US').format(price) + ' MMK';
};

export const VariantSelector: React.FC<VariantSelectorProps> = ({ variants, selectedVariantId, onVariantChange }) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-3">
      {variants.map((variant) => {
        const isSelected = variant.variantId === selectedVariantId;
        const isOutOfStock = variant.availableQuantity <= 0 || variant.stockStatus === 'OUT_OF_STOCK';
        
        const label = variant.options && variant.options.length > 0
          ? variant.options.map(opt => `${opt.variationName}: ${opt.value}`).join(' / ')
          : variant.sku;

        const effectivePrice = variant.discountPrice !== null ? variant.discountPrice : variant.sellingPrice;
        const hasDiscount = variant.discountPrice !== null;

        return (
          <button
            key={variant.variantId}
            type="button"
            disabled={isOutOfStock}
            onClick={() => onVariantChange(variant)}
            className={`relative flex w-full flex-col rounded-lg border p-4 text-left transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isOutOfStock
                ? 'cursor-not-allowed border-border-subtle bg-page opacity-50'
                : isSelected
                ? 'border-primary bg-primary text-white shadow-md ring-1 ring-primary'
                : 'cursor-pointer border-border-subtle bg-surface hover:border-text-muted hover:shadow-sm'
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className={`text-sm font-medium ${isOutOfStock ? 'text-text-muted' : isSelected ? 'text-white' : 'text-text-main'}`}>
                {label}
              </span>
              {isOutOfStock && (
                <span className="text-xs font-semibold text-[#B42318]">Out of Stock</span>
              )}
            </div>
            
            <div className="mt-2 flex items-center space-x-2">
              <span className={`text-base font-bold ${isOutOfStock ? 'text-text-muted' : isSelected ? 'text-white' : 'text-primary'}`}>
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className={`text-sm font-medium line-through ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                  {formatPrice(variant.sellingPrice)}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
