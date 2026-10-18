import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { searchHistoryApi } from '../api/searchHistoryApi';

export const useProductSearch = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const executeSearch = (keyword: string) => {
    const trimmed = keyword.trim();
    
    if (!trimmed) {
      return;
    }

    if (isAuthenticated) {
      // Fire and forget history recording. Failure should not block navigation.
      searchHistoryApi.recordSearch(trimmed).catch((error) => {
        console.error('Failed to record search history:', error);
      });
    }

    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  return { executeSearch };
};
