import { axiosClient } from "../../../api/axiosClient";
import type { CustomerAddressResponse } from "../../checkout/types";

export const profileApi = {
  getCustomerAddresses: async (): Promise<CustomerAddressResponse[]> => {
    const response = await axiosClient.get("/v1/profile/addresses");
    return response.data;
  },

  updateProfile: async (data: { fullName: string; phone: string }) => {
    const response = await axiosClient.put("/v1/auth/customer/me", data);
    return response.data;
  },

  createAddress: async (data: any): Promise<CustomerAddressResponse> => {
    const response = await axiosClient.post("/v1/profile/addresses", data);
    return response.data;
  },

  updateAddress: async (
    addressId: number,
    data: any,
  ): Promise<CustomerAddressResponse> => {
    const response = await axiosClient.put(
      `/v1/profile/addresses/${addressId}`,
      data,
    );
    return response.data;
  },

  deleteAddress: async (addressId: number): Promise<void> => {
    await axiosClient.delete(`/v1/profile/addresses/${addressId}`);
  },

  setDefaultAddress: async (
    addressId: number,
  ): Promise<CustomerAddressResponse> => {
    const response = await axiosClient.put(
      `/v1/profile/addresses/${addressId}/default`,
    );
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await axiosClient.put(
      "/v1/auth/customer/change-password",
      data,
    );
    return response.data;
  },
};
