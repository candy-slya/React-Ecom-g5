import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';
import type { PageResponse, ProductListResponse } from '../types';

interface UseProductsParams {
  categoryId?: number;
  brandId?: number;
  search?: string;
  page?: number;
  size?: number;
}

export const useProducts = ({ categoryId, brandId, search, page, size }: UseProductsParams) => {
  const [data, setData] = useState<PageResponse<ProductListResponse> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productApi.getProducts({ categoryId, brandId, search, page, size });
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

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [categoryId, brandId, search, page, size, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { data, loading, error, refetch };
};
