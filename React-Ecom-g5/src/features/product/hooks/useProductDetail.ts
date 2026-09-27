import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';
import type { ProductDetailResponse } from '../types';

export const useProductDetail = (productId: number | null) => {
  const [data, setData] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (productId === null || isNaN(productId) || productId <= 0) {
      return;
    }

    let ignore = false;
    
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productApi.getProductDetail(productId);
        if (!ignore) {
          setData(response);
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      ignore = true;
    };
  }, [productId, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { data, loading, error, refetch };
};
