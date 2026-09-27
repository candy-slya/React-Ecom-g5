import React from 'react';
import { ProductCard } from './ProductCard';
import type { ProductListResponse } from '../types';

interface ProductGridProps {
  products: ProductListResponse[];
  loading: boolean;
  onProductClick?: (productId: number) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, onProductClick }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex animate-pulse flex-col overflow-hidden rounded-lg bg-surface shadow-sm">
            <div className="aspect-[4/5] w-full bg-border-subtle opacity-50"></div>
            <div className="flex flex-1 flex-col space-y-3 border-t border-border-subtle p-4">
              <div className="h-3 w-1/2 rounded bg-border-subtle"></div>
              <div className="h-4 w-full rounded bg-border-subtle"></div>
              <div className="h-4 w-3/4 rounded bg-border-subtle"></div>
              <div className="mt-auto pt-2">
                <div className="h-5 w-1/3 rounded bg-border-subtle"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted">
        No products found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.productId}
          product={product}
          onClick={onProductClick ? () => onProductClick(product.productId) : undefined}
        />
      ))}
    </div>
  );
};
