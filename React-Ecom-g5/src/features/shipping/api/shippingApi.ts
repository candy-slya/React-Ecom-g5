import { axiosClient } from '../../../api/axiosClient';
import type { DeliveryZoneResponse, ShippingQuoteResponse } from '../../checkout/types';

export const shippingApi = {
  getAvailableDeliveryZones: async (): Promise<DeliveryZoneResponse[]> => {
    const response = await axiosClient.get('/v1/delivery-zones/available');
    return response.data;
  },
  getShippingQuote: async (addressId: number): Promise<ShippingQuoteResponse> => {
    const response = await axiosClient.get('/v1/shipping/quote', { params: { addressId } });
    return response.data;
  },
  getCustomShippingQuote: async (city: string, township: string): Promise<ShippingQuoteResponse> => {
    const response = await axiosClient.post('/v1/shipping/quote/custom', { city, township });
    return response.data;
  },
};
