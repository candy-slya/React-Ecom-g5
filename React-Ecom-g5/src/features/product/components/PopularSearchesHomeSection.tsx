import React, { useEffect, useState } from 'react';
import { productApi } from '../api/productApi';
import type { ProductListResponse } from '../types';
import { ProductCard } from '../../../components/product/ProductCard';

export const PopularSearchesHomeSection: React.FC = () => {
  const [trendingProducts, setTrendingProducts] = useState<ProductListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getTrendingProducts(0, 4);
        if (isMounted) {
          setTrendingProducts(data.content || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load trending products:', err);
          setError('Failed to load');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchTrendingProducts();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || error || trendingProducts.length === 0) {
    return null; // Graceful non-rendering for empty or error states
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-1">
        Trending Now
      </h2>
      <div className="text-sm text-gray-500 mb-4">
        Discover what's trending across the store.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingProducts.map((p) => (
          <ProductCard
            key={p.productId}
            product={p}
          />
        ))}
      </div>
    </section>
  );
};
