import { axiosClient } from '../../../api/axiosClient';
import type {
  SearchHistoryRequest,
  RecentSearchResponse,
  PopularSearchResponse,
} from '../types';

export const searchHistoryApi = {
  recordSearch: async (keyword: string): Promise<void> => {
    const request: SearchHistoryRequest = { keyword };
    const response = await axiosClient.post<void>('/v1/search-history', request);
    return response.data;
  },

  getRecentSearches: async (): Promise<RecentSearchResponse[]> => {
    const response = await axiosClient.get<RecentSearchResponse[]>('/v1/search-history/recent');
    return response.data;
  },

  getPopularSearches: async (): Promise<PopularSearchResponse[]> => {
    const response = await axiosClient.get<PopularSearchResponse[]>('/v1/search-history/popular');
    return response.data;
  },

  deleteSearch: async (keyword: string): Promise<void> => {
    const response = await axiosClient.delete<void>('/v1/search-history/item', {
      params: { keyword }
    });
    return response.data;
  },

  clearSearchHistory: async (): Promise<void> => {
    const response = await axiosClient.delete<void>('/v1/search-history/all');
    return response.data;
  },
};
