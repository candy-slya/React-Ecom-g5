import { axiosClient } from '../../../api/axiosClient';
import type { CreateOrderRequest, OrderResponse } from '../types';

export const checkoutApi = {
  createOrder: async (request: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await axiosClient.post('/v1/orders', request);
    return response.data;
  },
};
