import { axiosClient } from '../../../api/axiosClient';
import type { OrderResponse } from '../../checkout/types';
import type { OrderDetailResponse, OrderListResponse, Page, PendingOrderExpiryResponse } from '../types';

export interface GetMyOrdersParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  orderStatus?: string;
  orderNo?: string;
}

export const orderApi = {
  getOrderById: async (orderId: number | string): Promise<OrderResponse> => {
    const response = await axiosClient.get(`/v1/orders/${orderId}`);
    return response.data;
  },
  
  getMyOrders: async (params: GetMyOrdersParams = {}): Promise<Page<OrderListResponse>> => {
    const { page = 0, size = 10, startDate, endDate, orderStatus, orderNo } = params;
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('size', size.toString());
    query.append('sort', 'createdAt,desc');
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    if (orderStatus) query.append('orderStatus', orderStatus);
    if (orderNo) query.append('orderNo', orderNo);

    const response = await axiosClient.get(`/v1/orders?${query.toString()}`);
    return response.data;
  },

  downloadInvoicePdf: async (orderId: number | string): Promise<Blob> => {
    const response = await axiosClient.get(`/v1/orders/${orderId}/invoice/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadOrderHistoryPdf: async (params: GetMyOrdersParams = {}): Promise<Blob> => {
    const { startDate, endDate, orderStatus, orderNo } = params;
    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    if (orderStatus) query.append('orderStatus', orderStatus);
    if (orderNo) query.append('orderNo', orderNo);

    const response = await axiosClient.get(`/v1/orders/report/pdf?${query.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  restoreToCart: async (orderId: number | string): Promise<RestoreToCartResponse> => {
    const response = await axiosClient.post<RestoreToCartResponse>(`/v1/orders/${orderId}/restore-to-cart`);
    return response.data;
  },

  resumePayment: async (orderId: number | string): Promise<OrderDetailResponse> => {
    const response = await axiosClient.post(`/v1/orders/${orderId}/resume-payment`);
    return response.data;
  },

  getPendingOrderExpiry: async (): Promise<PendingOrderExpiryResponse> => {
    const response = await axiosClient.get<PendingOrderExpiryResponse>('/v1/orders/pending-expiry');
    return response.data;
  }
};

export interface RestoredItemDetail {
  variantId: number | null;
  productName: string;
  requestedQuantity: number;
  restoredQuantity: number;
  status: string;
  message: string;
}

export interface RestoreToCartResponse {
  orderId: number;
  activeCartId: number;
  restoredItemCount: number;
  skippedItemCount: number;
  message: string;
  items: RestoredItemDetail[];
}
