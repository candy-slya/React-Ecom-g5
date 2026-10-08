import { axiosClient } from '../../../api/axiosClient';
import type {
  CategoryNodeResponse,
  PageResponse,
  ProductDetailResponse,
  ProductListResponse,
} from '../types';

export interface BrandResponse {
  brandId: number;
  brandName: string;
  brandLogoUrl: string | null;
}

interface GetProductsParams {
  categoryId?: number;
  brandId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  tags?: string[];
  sort?: string;
  page?: number;
  size?: number;
}

export const productApi = {
  getProducts: async (params: GetProductsParams): Promise<PageResponse<ProductListResponse>> => {
    const cleanParams: Record<string, any> = {};

    if (params.categoryId != null) cleanParams.categoryId = params.categoryId;
    if (params.brandId != null) cleanParams.brandId = params.brandId;
    if (params.search != null && params.search.trim() !== '') cleanParams.search = params.search.trim();
    if (params.minPrice != null) cleanParams.minPrice = params.minPrice;
    if (params.maxPrice != null) cleanParams.maxPrice = params.maxPrice;
    if (params.availability != null) cleanParams.availability = params.availability;
    if (params.tags != null && params.tags.length > 0) cleanParams.tags = params.tags.join(',');
    if (params.sort != null) cleanParams.sort = params.sort;
    if (params.page != null) cleanParams.page = params.page;
    if (params.size != null) cleanParams.size = params.size;

    const response = await axiosClient.get<PageResponse<ProductListResponse>>('/v1/products', {
      params: cleanParams,
    });
    return response.data;
  },

  getProductDetail: async (productId: number): Promise<ProductDetailResponse> => {
    const response = await axiosClient.get<ProductDetailResponse>(`/v1/products/${productId}`);
    return response.data;
  },

  getCategoryTree: async (): Promise<CategoryNodeResponse[]> => {
    const response = await axiosClient.get<CategoryNodeResponse[]>('/v1/categories/tree');
    return response.data;
  },
  
  getActiveBrands: async (): Promise<BrandResponse[]> => {
    const response = await axiosClient.get<BrandResponse[]>('/v1/brands');
    return response.data;
  },
  
  getBestSellers: async (): Promise<PageResponse<ProductListResponse>> => {
    const response = await axiosClient.get<PageResponse<ProductListResponse>>('/v1/products/best-sellers');
    return response.data;
  },
  
  getAllTags: async (): Promise<string[]> => {
    const response = await axiosClient.get<string[]>('/v1/tags');
    return response.data;
  },
  
  getRelatedProducts: async (productId: number): Promise<ProductListResponse[]> => {
    const response = await axiosClient.get<ProductListResponse[]>(`/v1/products/${productId}/related`);
    return response.data;
  },

  getTrendingProducts: async (page: number = 0, size: number = 4): Promise<PageResponse<ProductListResponse>> => {
    const response = await axiosClient.get<PageResponse<ProductListResponse>>('/v1/products/trending', {
      params: { page, size }
    });
    return response.data;
  },

  getTrendingSuggestions: async (prefix: string): Promise<ProductListResponse[]> => {
    const response = await axiosClient.get<ProductListResponse[]>('/v1/products/suggestions', {
      params: { prefix }
    });
    return response.data;
  }
};
