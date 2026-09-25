import { axiosClient } from '../../../api/axiosClient';
import type { LoginRequest, RegisterRequest, AuthResponse, CustomerMeResponse } from '../types';

export const authApi = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/v1/auth/customer/login', request);
    return response.data;
  },

  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/v1/auth/customer/register', request);
    return response.data;
  },

  getCurrentCustomer: async (): Promise<CustomerMeResponse> => {
    const response = await axiosClient.get<CustomerMeResponse>('/v1/auth/customer/me');
    return response.data;
  },
};
