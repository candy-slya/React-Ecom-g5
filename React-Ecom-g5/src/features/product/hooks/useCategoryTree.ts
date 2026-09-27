import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';
import type { CategoryNodeResponse } from '../types';

export const useCategoryTree = () => {
  const [data, setData] = useState<CategoryNodeResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productApi.getCategoryTree();
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

    fetchCategories();

    return () => {
      ignore = true;
    };
  }, [refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { data, loading, error, refetch };
};
