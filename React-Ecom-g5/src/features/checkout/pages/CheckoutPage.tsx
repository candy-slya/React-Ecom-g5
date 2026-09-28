import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../../profile/api/profileApi';
import { shippingApi } from '../../shipping/api/shippingApi';
import { checkoutApi } from '../api/checkoutApi';
import type { CustomerAddressResponse, ShippingQuoteResponse, CustomShippingAddressRequest } from '../types';
import { AddressSelection } from '../components/AddressSelection';
import { OrderSummary } from '../components/OrderSummary';
import { isAxiosError } from 'axios';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { fetchAuthenticatedCart } from '../../cart/store/cartSlice';
import { useDeliveryLocations } from '../../../hooks/useDeliveryLocations';

const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (isAxiosError(error) && typeof error.response?.data === 'string') {
    return error.response.data;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { authenticatedCart } = useAppSelector((state) => state.cart);
  const { cities, getTownshipsForCity, getZoneForLocation, loading: zonesLoading } = useDeliveryLocations();
  
  const [addresses, setAddresses] = useState<CustomerAddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  const [addressMode, setAddressMode] = useState<'saved' | 'custom'>('saved');
  const [customAddress, setCustomAddress] = useState<CustomShippingAddressRequest>({
    recipientName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    township: '',
    city: '',
    regionOrState: '',
  });

  const [shippingQuote, setShippingQuote] = useState<ShippingQuoteResponse | null>(null);
  const [shippingLoading, setShippingLoading] = useState<boolean>(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Track the custom location that was successfully quoted to invalidate if changed
  const [quotedCustomLocation, setQuotedCustomLocation] = useState<{city: string, township: string} | null>(null);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const addressData = await profileApi.getCustomerAddresses();
      setAddresses(addressData);
      
      if (addressData.length > 0) {
        const defaultAddress = addressData.find((a) => a.isDefault);
        setSelectedAddressId(defaultAddress ? defaultAddress.addressId : addressData[0].addressId);
        setAddressMode('saved');
      } else {
        setAddressMode('custom');
      }

    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchAuthenticatedCart());
    fetchCheckoutData();
  }, [dispatch]);

  // Fetch quote when saved address changes or mode switches to saved
  useEffect(() => {
    const fetchSavedShippingQuote = async () => {
      if (!selectedAddressId || addressMode !== 'saved') {
        if (addressMode === 'saved') {
          setShippingQuote(null);
          setShippingError(null);
        }
        return;
      }

      try {
        setShippingLoading(true);
        setShippingError(null);
        const quote = await shippingApi.getShippingQuote(selectedAddressId);
        setShippingQuote(quote);
      } catch (err: unknown) {
        setShippingError(extractErrorMessage(err));
        setShippingQuote(null);
      } finally {
        setShippingLoading(false);
      }
    };

    fetchSavedShippingQuote();
  }, [selectedAddressId, addressMode]);

  const handleCustomAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setCustomAddress(prev => ({
      ...prev,
      city,
      township: '',
      regionOrState: ''
    }));
    setShippingQuote(null);
    setShippingError(null);
    setQuotedCustomLocation(null);
  };

  const handleCustomTownshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const township = e.target.value;
    const zone = getZoneForLocation(customAddress.city, township);
    setCustomAddress(prev => ({
      ...prev,
      township,
      regionOrState: zone?.regionOrState || prev.regionOrState
    }));
    setShippingQuote(null);
    setShippingError(null);
    setQuotedCustomLocation(null);
  };

  const handleCheckCustomDelivery = async () => {
    if (!customAddress.city.trim() || !customAddress.township.trim()) return;

    try {
      setShippingLoading(true);
      setShippingError(null);
      
      const city = customAddress.city.trim();
      const township = customAddress.township.trim();
      
      const quote = await shippingApi.getCustomShippingQuote(city, township);
      setShippingQuote(quote);
      setQuotedCustomLocation({ city, township });
    } catch (err: unknown) {
      setShippingError(extractErrorMessage(err));
      setShippingQuote(null);
      setQuotedCustomLocation(null);
    } finally {
      setShippingLoading(false);
    }
  };

  const handleRetry = () => {
    dispatch(fetchAuthenticatedCart());
    fetchCheckoutData();
  };

  const handlePlaceOrder = async () => {
    setOrderError(null);

    if (shippingError || !shippingQuote) {
      setOrderError("Delivery is currently unavailable for this location.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const requestPayload = addressMode === 'saved' 
        ? { savedAddressId: selectedAddressId, shippingAddress: null }
        : { savedAddressId: null, shippingAddress: {
            recipientName: customAddress.recipientName.trim(),
            phoneNumber: customAddress.phoneNumber.trim(),
            addressLine1: customAddress.addressLine1.trim(),
            addressLine2: customAddress.addressLine2?.trim() || undefined,
            township: customAddress.township.trim(),
            city: customAddress.city.trim(),
            regionOrState: customAddress.regionOrState?.trim() || undefined,
          } };

      const response = await checkoutApi.createOrder(requestPayload);
      navigate(`/payment/${response.orderId}`, { state: { order: response } });
    } catch (err) {
      setOrderError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-page">
        <div className="text-center text-text-muted">
          <div className="mb-4 mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border-subtle border-t-primary"></div>
          <p>Loading Checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 px-4">
        <div className="mx-auto max-w-2xl rounded-lg border border-[#B42318]/20 bg-surface p-6 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-[#B42318]">Error Loading Checkout</h2>
          <p className="mb-6 text-text-main">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentCartItems = authenticatedCart?.items || [];
  const selectedShippingFee = shippingQuote?.shippingFee || 0;
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' MMK';
  };

  const isCustomFormValid = !!customAddress.recipientName.trim() && 
                            !!customAddress.phoneNumber.trim() && 
                            !!customAddress.addressLine1.trim() && 
                            !!customAddress.township.trim() && 
                            !!customAddress.city.trim();

  const isPlaceOrderDisabled = isSubmitting || 
                               (addressMode === 'saved' && !selectedAddressId) || 
                               (addressMode === 'custom' && (!isCustomFormValid || !quotedCustomLocation)) ||
                               shippingLoading || 
                               !!shippingError || 
                               !shippingQuote || 
                               currentCartItems.length === 0;

  return (
    <div className="bg-page py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-text-main sm:text-4xl">Checkout</h1>
        
        {orderError && (
          <div className="mb-8 rounded-md bg-[#B42318]/10 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-[#B42318]">Checkout Failed</h3>
                <div className="mt-2 text-sm text-[#B42318]">
                  <p>{orderError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          <div className="lg:col-span-8 space-y-8">
            
            <div className="rounded-lg border border-border-subtle bg-surface shadow-sm overflow-hidden">
              <div className="border-b border-border-subtle px-4 py-5 sm:px-6">
                <h3 className="text-lg font-bold text-text-main">Shipping Address</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                
                {addresses.length > 0 && (
                  <div>
                    <label className="flex items-center cursor-pointer mb-4">
                      <input 
                        type="radio" 
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300" 
                        checked={addressMode === 'saved'} 
                        onChange={() => setAddressMode('saved')} 
                      />
                      <span className="ml-3 block text-base font-medium text-text-main">Saved Address</span>
                    </label>
                    {addressMode === 'saved' && (
                      <div className="ml-7">
                        <AddressSelection
                          addresses={addresses}
                          selectedAddressId={selectedAddressId}
                          onSelect={setSelectedAddressId}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="flex items-center cursor-pointer mb-4">
                    <input 
                      type="radio" 
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300" 
                      checked={addressMode === 'custom'} 
                      onChange={() => setAddressMode('custom')} 
                    />
                    <span className="ml-3 block text-base font-medium text-text-main">Use a different address for this order</span>
                  </label>
                  
                  {addressMode === 'custom' && (
                    <div className="ml-7 mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text-main">Recipient Name *</label>
                        <input type="text" name="recipientName" value={customAddress.recipientName} onChange={handleCustomAddressChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text-main">Phone Number *</label>
                        <input type="text" name="phoneNumber" value={customAddress.phoneNumber} onChange={handleCustomAddressChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text-main">Address Line 1 *</label>
                        <input type="text" name="addressLine1" value={customAddress.addressLine1} onChange={handleCustomAddressChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text-main">Address Line 2</label>
                        <input type="text" name="addressLine2" value={customAddress.addressLine2} onChange={handleCustomAddressChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-main">City *</label>
                        <select 
                          name="city" 
                          value={customAddress.city} 
                          onChange={handleCustomCityChange} 
                          disabled={zonesLoading || cities.length === 0}
                          className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                        >
                          <option value="" disabled>Select City</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-main">Township *</label>
                        <select 
                          name="township" 
                          value={customAddress.township} 
                          onChange={handleCustomTownshipChange} 
                          disabled={zonesLoading || !customAddress.city || getTownshipsForCity(customAddress.city).length === 0}
                          className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                        >
                          <option value="" disabled>Select Township</option>
                          {getTownshipsForCity(customAddress.city).map(township => (
                            <option key={township} value={township}>{township}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text-main">Region / State</label>
                        <input type="text" name="regionOrState" value={customAddress.regionOrState} onChange={handleCustomAddressChange} className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>
                      
                      {!zonesLoading && cities.length === 0 && (
                        <div className="sm:col-span-2 mt-2 text-sm text-[#B42318]">
                          Delivery locations are currently unavailable.
                        </div>
                      )}
                      
                      <div className="sm:col-span-2 mt-2">
                        <button 
                          type="button" 
                          onClick={handleCheckCustomDelivery} 
                          disabled={shippingLoading || !customAddress.city.trim() || !customAddress.township.trim() || !getZoneForLocation(customAddress.city, customAddress.township)}
                          className="w-full sm:w-auto rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-text-main shadow-sm hover:bg-page focus:outline-none disabled:opacity-50"
                        >
                          Check Delivery
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
            
            <div className="rounded-lg border border-border-subtle bg-surface shadow-sm">
              <div className="border-b border-border-subtle px-4 py-5 sm:px-6">
                <h3 className="text-lg font-bold text-text-main">Delivery</h3>
              </div>
              <div className="p-4 sm:p-6">
                {shippingLoading ? (
                  <div className="flex items-center space-x-2 text-text-muted">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-border-subtle border-t-primary"></div>
                    <span className="text-sm">Calculating shipping...</span>
                  </div>
                ) : shippingError ? (
                  <div className="rounded-md bg-[#B42318]/10 p-4 text-sm text-[#B42318]">
                    {shippingError}
                  </div>
                ) : shippingQuote ? (
                  <div className="space-y-2 text-sm text-text-main">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Estimated delivery:</span>
                      <span className="font-medium">{shippingQuote.estimatedDays || '-'} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Shipping fee:</span>
                      <span className="font-medium">{formatPrice(shippingQuote.shippingFee)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-text-muted">
                    {addressMode === 'saved' 
                      ? 'Please select an address to see delivery options.' 
                      : 'Please enter City and Township and click Check Delivery.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 lg:col-span-4 lg:mt-0 space-y-6">
            <OrderSummary 
              cartItems={currentCartItems} 
              shippingFee={selectedShippingFee} 
            />
            
            <div className="rounded-lg border border-border-subtle bg-surface px-4 py-6 shadow-sm sm:p-6">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlaceOrderDisabled}
                className="w-full rounded-md bg-primary px-4 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-border-subtle disabled:text-text-muted"
              >
                {isSubmitting ? 'Creating Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
