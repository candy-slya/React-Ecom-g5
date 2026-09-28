import { axiosClient } from '../../../api/axiosClient';

export interface MockCallbackRequest {
  externalEventId: string;
  transactionRef: string;
  status: string;
}

export interface MockCallbackResponse {
  orderId: number;
  paymentStatus: string;
}

export const mockCallbackApi = {
  submitCallback: async (request: MockCallbackRequest): Promise<MockCallbackResponse> => {
    const response = await axiosClient.post('/v1/payment-callbacks/g3', request);
    return response.data;
  },
};
