import { axiosClient } from '../../../api/axiosClient';
import type { OrderResponse } from '../../checkout/types';
import type { OrderListResponse, Page } from '../types';

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
  }
};
