import { axiosClient } from '../../../api/axiosClient';

export interface PaymentInitiateRequest {
  paymentMethod: string;
}

export interface PaymentInitiateResponse {
  paymentId: number;
  orderId: number;
  paymentStatus: string;
  amount: number;
  redirectUrl: string;
}

export interface PaymentDetailResponse {
  paymentId: number;
  orderId: number;
  paymentStatus: string;
  paymentMethod: string;
  transactionRef: string;
  amount: number;
  paidAt: string | null;
  createdAt: string;
}

export const paymentApi = {
  initiatePayment: async (orderId: number | string, paymentMethod: string): Promise<PaymentInitiateResponse> => {
    const request: PaymentInitiateRequest = { paymentMethod };
    const response = await axiosClient.post(`/v1/payments/orders/${orderId}/initiate`, request);
    return response.data;
  },

  getLatestPayment: async (orderId: number | string): Promise<PaymentDetailResponse> => {
    const response = await axiosClient.get(`/v1/payments/orders/${orderId}/latest`);
    return response.data;
  },
};
