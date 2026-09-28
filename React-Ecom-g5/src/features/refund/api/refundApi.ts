import { axiosClient } from '../../../api/axiosClient';
import type { RefundEligibilityDto, RefundRequestDto, RefundResponseDto } from '../types';

export const refundApi = {
  createRefundRequest: async (data: RefundRequestDto): Promise<RefundResponseDto> => {
    const response = await axiosClient.post('/v1/refunds', data);
    return response.data;
  },

  getMyRefunds: async (): Promise<RefundResponseDto[]> => {
    const response = await axiosClient.get('/v1/refunds');
    return response.data;
  },

  getRefundById: async (refundId: number): Promise<RefundResponseDto> => {
    const response = await axiosClient.get(`/v1/refunds/${refundId}`);
    return response.data;
  },

  getRefundEligibility: async (orderItemId: number): Promise<RefundEligibilityDto> => {
    const response = await axiosClient.get(`/v1/refunds/eligibility/${orderItemId}`);
    return response.data;
  }
};
