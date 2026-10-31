import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { profileApi } from '../../profile/api/profileApi';
import { shippingApi } from '../../shipping/api/shippingApi';
import { checkoutApi } from '../api/checkoutApi';
import { cartApi } from '../../cart/api/cartApi';
import type { CustomerAddressResponse, ShippingQuoteResponse, CustomShippingAddressRequest, CreateOrderRequest } from '../types';
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

type CheckoutMode = 'CART' | 'BUY_NOW';

interface ValidatedBuyNowItem {
  variantId: number;
  quantity: number;
}

interface CheckoutStateValidation {
  isValid: boolean;
  mode: CheckoutMode;
  buyNowItem: ValidatedBuyNowItem | null;
  errorMessage: string | null;
}

interface BuyNowResolvedDisplayItem {
  variantId: number;
  productId: number;
  productName: string;
  imageUrl: string;
  sku: string;
  options: Record<string, string>;
  quantity: number;
  effectivePrice: number;
  subtotal: number;
  availableQuantity: number;
  stockStatus: string;
  available: boolean;
}

const isPositiveIntegerString = (str: string | null): boolean => {
  if (!str) return false;
  return /^[1-9]\d*$/.test(str.trim());
};

const validateCheckoutIntent = (
  search: string,
  state: unknown,
): CheckoutStateValidation => {
  const searchParams = new URLSearchParams(search);

  // Reject duplicate or conflicting parameters in URL
  if (
    searchParams.getAll('mode').length > 1 ||
    searchParams.getAll('variantId').length > 1 ||
    searchParams.getAll('qty').length > 1
  ) {
    return {
      isValid: false,
      mode: 'CART',
      buyNowItem: null,
      errorMessage: 'Invalid checkout request: duplicate or conflicting URL parameters.',
    };
  }

  const urlMode = searchParams.get('mode');
  const hasUrlVariantId = searchParams.has('variantId');
  const hasUrlQty = searchParams.has('qty');

  // Case 1: Explicit URL mode is "buy_now"
  if (urlMode === 'buy_now') {
    const rawVariantId = searchParams.get('variantId');
    const rawQty = searchParams.get('qty');

    if (!isPositiveIntegerString(rawVariantId) || !isPositiveIntegerString(rawQty)) {
      return {
        isValid: false,
        mode: 'BUY_NOW',
        buyNowItem: null,
        errorMessage: 'Invalid Buy Now parameters: variantId and qty must be positive integers.',
      };
    }

    const variantId = Number(rawVariantId);
    const quantity = Number(rawQty);

    // If React Router state is also provided, ensure it does not contradict the URL
    if (state != null && typeof state === 'object' && !Array.isArray(state)) {
      const s = state as Record<string, unknown>;
      if (s.checkoutMode !== undefined && s.checkoutMode !== 'BUY_NOW') {
        return {
          isValid: false,
          mode: 'BUY_NOW',
          buyNowItem: null,
          errorMessage: 'Contradictory checkout mode between URL and session state.',
        };
      }
      if (s.buyNowItem != null && typeof s.buyNowItem === 'object' && !Array.isArray(s.buyNowItem)) {
        const item = s.buyNowItem as Record<string, unknown>;
        if (
          (item.variantId !== undefined && item.variantId !== variantId) ||
          (item.quantity !== undefined && item.quantity !== quantity)
        ) {
          return {
            isValid: false,
            mode: 'BUY_NOW',
            buyNowItem: null,
            errorMessage: 'Contradictory item details between URL and session state.',
          };
        }
      }
    }

    return {
      isValid: true,
      mode: 'BUY_NOW',
      buyNowItem: { variantId, quantity },
      errorMessage: null,
    };
  }

  // Case 2: Explicit URL mode is "cart"
  if (urlMode === 'cart') {
    if (hasUrlVariantId || hasUrlQty) {
      return {
        isValid: false,
        mode: 'CART',
        buyNowItem: null,
        errorMessage: 'Invalid cart checkout request: variant parameters are not allowed in cart mode.',
      };
    }
    if (state != null && typeof state === 'object' && !Array.isArray(state)) {
      const s = state as Record<string, unknown>;
      if (s.checkoutMode === 'BUY_NOW' || s.buyNowItem != null) {
        return {
          isValid: false,
          mode: 'CART',
          buyNowItem: null,
          errorMessage: 'Contradictory checkout mode between URL and session state.',
        };
      }
    }
    return { isValid: true, mode: 'CART', buyNowItem: null, errorMessage: null };
  }

  // Case 3: Unknown URL mode (e.g. ?mode=express, ?mode=abc)
  if (urlMode !== null) {
    return {
      isValid: false,
      mode: 'CART',
      buyNowItem: null,
      errorMessage: `Invalid checkout mode in URL: "${urlMode}".`,
    };
  }

  // Case 4: No URL mode specified (urlMode === null)
  // Check if variant parameters exist without mode=buy_now
  if (hasUrlVariantId || hasUrlQty) {
    return {
      isValid: false,
      mode: 'CART',
      buyNowItem: null,
      errorMessage: 'Invalid checkout URL: variant parameters require mode=buy_now.',
    };
  }

  // Fallback to checking location.state for backward compatibility with state-only callers
  if (state == null) {
    return { isValid: true, mode: 'CART', buyNowItem: null, errorMessage: null };
  }

  if (typeof state !== 'object' || Array.isArray(state)) {
    return {
      isValid: false,
      mode: 'CART',
      buyNowItem: null,
      errorMessage: 'Invalid checkout state format.',
    };
  }

  const s = state as Record<string, unknown>;
  const hasBuyNowItem = 'buyNowItem' in s && s.buyNowItem != null;

  if ('checkoutMode' in s && s.checkoutMode !== undefined && s.checkoutMode !== 'CART' && s.checkoutMode !== 'BUY_NOW') {
    return {
      isValid: false,
      mode: 'CART',
      buyNowItem: null,
      errorMessage: `Invalid checkout mode: "${String(s.checkoutMode)}".`,
    };
  }

  if (hasBuyNowItem && s.checkoutMode !== 'BUY_NOW') {
    return {
      isValid: false,
      mode: 'CART',
      buyNowItem: null,
      errorMessage: 'Invalid checkout state: buyNowItem was provided without BUY_NOW checkout mode.',
    };
  }

  if (s.checkoutMode === 'CART' || (s.checkoutMode === undefined && !hasBuyNowItem)) {
    return { isValid: true, mode: 'CART', buyNowItem: null, errorMessage: null };
  }

  if (s.checkoutMode === 'BUY_NOW') {
    if (!hasBuyNowItem || typeof s.buyNowItem !== 'object' || Array.isArray(s.buyNowItem)) {
      return {
        isValid: false,
        mode: 'BUY_NOW',
        buyNowItem: null,
        errorMessage: 'Invalid Buy Now request: item details are missing.',
      };
    }

    const item = s.buyNowItem as Record<string, unknown>;
    const variantId = item.variantId;
    const quantity = item.quantity;

    const isVariantValid = typeof variantId === 'number' && Number.isInteger(variantId) && variantId > 0;
    const isQuantityValid = typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0;

    if (!isVariantValid || !isQuantityValid) {
      return {
        isValid: false,
        mode: 'BUY_NOW',
        buyNowItem: null,
        errorMessage: 'Invalid Buy Now request: invalid variant ID or quantity.',
      };
    }

    return {
      isValid: true,
      mode: 'BUY_NOW',
      buyNowItem: { variantId, quantity },
      errorMessage: null,
    };
  }

  return {
    isValid: false,
    mode: 'CART',
    buyNowItem: null,
    errorMessage: 'Unrecognized checkout state.',
  };
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { authenticatedCart } = useAppSelector((state) => state.cart);

  const validation = useMemo(
    () => validateCheckoutIntent(location.search, location.state),
    [location.search, location.state]
  );
  const mode = validation.mode;

  const [buyNowResolvedItem, setBuyNowResolvedItem] = useState<BuyNowResolvedDisplayItem | null>(null);
  const [buyNowLoading, setBuyNowLoading] = useState<boolean>(false);
  const [buyNowError, setBuyNowError] = useState<string | null>(null);
  
  // Update useDeliveryLocations to pull regions and getCitiesForRegion
  const { regions, getCitiesForRegion, getTownshipsForCity, loading: zonesLoading } = useDeliveryLocations();
  
  const [addresses, setAddresses] = useState<CustomerAddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  const [addressMode, setAddressMode] = useState<'saved' | 'custom'>('saved');
  const [customAddress, setCustomAddress] = useState<CustomShippingAddressRequest>({
    recipientName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    regionOrState: '',
    city: '',
    township: '',
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

  const fetchBuyNowItem = useCallback(async (variantId: number, quantity: number) => {
    try {
      setBuyNowLoading(true);
      setBuyNowError(null);

      const response = await cartApi.resolveGuestCart({
        items: [{ variantId, quantity }],
      });

      const item = response.items?.find((i) => i.variantId === variantId);
      if (!item) {
        setBuyNowError('The requested product variant could not be found.');
        return;
      }

      if (!item.available) {
        if (item.availableQuantity === 0) {
          setBuyNowError('This product variant is currently out of stock.');
        } else if (quantity > item.availableQuantity) {
          setBuyNowError(`Only ${item.availableQuantity} item(s) available in stock.`);
        } else {
          setBuyNowError('This product variant is currently unavailable for purchase.');
        }
        return;
      }

      const optionEntries = item.options ? Object.entries(item.options) : [];
      const optionsText = optionEntries
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      const displayName = optionsText
        ? `${item.productName || 'Product'} (${optionsText})`
        : (item.productName || 'Product');

      setBuyNowResolvedItem({
        variantId: item.variantId,
        productId: item.productId || 0,
        productName: displayName,
        imageUrl: item.imageUrl || '',
        sku: item.sku || '',
        options: item.options || {},
        quantity: item.quantity,
        effectivePrice: item.effectivePrice,
        subtotal: item.subtotal || (item.effectivePrice * item.quantity),
        availableQuantity: item.availableQuantity,
        stockStatus: item.stockStatus,
        available: item.available,
      });
    } catch (err) {
      setBuyNowError(extractErrorMessage(err));
    } finally {
      setBuyNowLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!validation.isValid) {
      setLoading(false);
      return;
    }

    if (validation.mode === 'BUY_NOW' && validation.buyNowItem) {
      fetchBuyNowItem(validation.buyNowItem.variantId, validation.buyNowItem.quantity);
    } else if (validation.mode === 'CART') {
      dispatch(fetchAuthenticatedCart());
    }
    fetchCheckoutData();
  }, [dispatch, validation.isValid, validation.mode, validation.buyNowItem, fetchBuyNowItem]);

  // Fetch quote when saved address changes or mode switches to saved
  useEffect(() => {
    let active = true;

    const fetchSavedShippingQuote = async () => {
      if (!selectedAddressId || addressMode !== 'saved') {
        setShippingQuote(null);
        setShippingError(null);
        return;
      }

      const selectedAddress = addresses.find((a) => a.addressId === selectedAddressId);
      if (!selectedAddress) return;

      try {
        setShippingLoading(true);
        setShippingQuote(null);
        setShippingError(null);
        const quote = await shippingApi.getShippingQuote(selectedAddressId);
        if (active) {
          setShippingQuote(quote);
        }
      } catch (err: unknown) {
        if (active) {
          setShippingQuote(null);
          setShippingError(
            extractErrorMessage(err) || 'Delivery is currently unavailable for this address.'
          );
        }
      } finally {
        if (active) {
          setShippingLoading(false);
        }
      }
    };

    fetchSavedShippingQuote();

    return () => {
      active = false;
    };
  }, [selectedAddressId, addressMode, addresses]);

  const handleCustomAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const onlyNums = value.replace(/[^0-9]/g, '').slice(0, 11);
      setCustomAddress(prev => ({ ...prev, phoneNumber: onlyNums }));
      return;
    }
    setCustomAddress(prev => ({ ...prev, [name]: value }));
  };

  // Handle Region Change (Resets City and Township)
  const handleCustomRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setCustomAddress(prev => ({
      ...prev,
      regionOrState: region,
      city: '',
      township: ''
    }));
    setShippingQuote(null);
    setShippingError(null);
    setQuotedCustomLocation(null);
  };

  // Handle City Change (Resets Township)
  const handleCustomCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setCustomAddress(prev => ({
      ...prev,
      city,
      township: ''
    }));
    setShippingQuote(null);
    setShippingError(null);
    setQuotedCustomLocation(null);
  };

  // Handle Township Change
  const handleCustomTownshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const township = e.target.value;
    setCustomAddress(prev => ({
      ...prev,
      township
    }));
    setShippingQuote(null);
    setShippingError(null);
    setQuotedCustomLocation(null);
  };

  const handleCheckCustomDelivery = async () => {
    if (!customAddress.city.trim() || !customAddress.township.trim()) return;

    const city = customAddress.city.trim();
    const township = customAddress.township.trim();

    try {
      setShippingLoading(true);
      setShippingQuote(null);
      setShippingError(null);
      setQuotedCustomLocation(null);
      
      const quote = await shippingApi.getCustomShippingQuote(city, township);
      setShippingQuote(quote);
      setQuotedCustomLocation({ city, township });
    } catch (err: unknown) {
      setShippingQuote(null);
      setQuotedCustomLocation(null);
      setShippingError(
        extractErrorMessage(err) || 'Delivery is currently unavailable for the specified location.'
      );
    } finally {
      setShippingLoading(false);
    }
  };

  const handleRetry = () => {
    if (mode === 'BUY_NOW') {
      if (validation.buyNowItem) {
        fetchBuyNowItem(validation.buyNowItem.variantId, validation.buyNowItem.quantity);
      }
    } else {
      dispatch(fetchAuthenticatedCart());
    }
    fetchCheckoutData();
  };

  const containsTownship = (text?: string) => {
    if (!text) return false;
    return /\b(township|tsp)\b|မြို့နယ်/i.test(text);
  };

  const isCustomLine1Invalid = containsTownship(customAddress.addressLine1);
  const isCustomLine2Invalid = containsTownship(customAddress.addressLine2);

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    setOrderError(null);

    if (shippingError || !shippingQuote) {
      setOrderError("Delivery is currently unavailable for this location.");
      return;
    }

    if (addressMode === 'custom' && (isCustomLine1Invalid || isCustomLine2Invalid)) {
      setOrderError("Please do not include 'Township' or 'Tsp' in Address Line 1 or 2.");
      return;
    }

    if (addressMode === 'saved' && !selectedAddressId) {
      setOrderError("Please select a shipping address.");
      return;
    }

    if (addressMode === 'custom' && (!isCustomFormValid || !quotedCustomLocation)) {
      setOrderError("Please fill in all address details and check delivery availability.");
      return;
    }

    const shippingAddressPayload: CustomShippingAddressRequest | null = addressMode === 'custom'
      ? {
          recipientName: customAddress.recipientName.trim(),
          phoneNumber: customAddress.phoneNumber.trim(),
          addressLine1: customAddress.addressLine1.trim(),
          addressLine2: customAddress.addressLine2?.trim() || undefined,
          regionOrState: customAddress.regionOrState?.trim() || undefined,
          city: customAddress.city.trim(),
          township: customAddress.township.trim(),
        }
      : null;

    let requestPayload: CreateOrderRequest;

    if (mode === 'BUY_NOW') {
      if (!validation.isValid || !validation.buyNowItem) {
        setOrderError("Invalid Buy Now session. Please return to the product page.");
        return;
      }

      if (!buyNowResolvedItem || !buyNowResolvedItem.available) {
        setOrderError("The selected product variant is currently unavailable or out of stock.");
        return;
      }

      if (validation.buyNowItem.quantity > buyNowResolvedItem.availableQuantity) {
        setOrderError(`Only ${buyNowResolvedItem.availableQuantity} item(s) available in stock.`);
        return;
      }

      requestPayload = {
        checkoutType: 'BUY_NOW',
        buyNowItem: {
          variantId: validation.buyNowItem.variantId,
          quantity: validation.buyNowItem.quantity,
        },
        savedAddressId: addressMode === 'saved' ? selectedAddressId : null,
        shippingAddress: shippingAddressPayload,
      };
    } else {
      if (currentCheckoutItems.length === 0) {
        setOrderError("Your shopping cart is empty.");
        return;
      }

      requestPayload = {
        checkoutType: 'CART',
        savedAddressId: addressMode === 'saved' ? selectedAddressId : null,
        shippingAddress: shippingAddressPayload,
      };
    }

    try {
      setIsSubmitting(true);
      const response = await checkoutApi.createOrder(requestPayload);
      navigate(`/payment/${response.orderId}`, { state: { order: response } });
    } catch (err) {
      setOrderError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!validation.isValid) {
    return (
      <div className="py-16 px-4 bg-page min-h-[60vh] flex items-center justify-center">
        <div className="mx-auto max-w-lg rounded-lg border border-[#B42318]/20 bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#B42318]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-[#B42318]">Invalid Checkout Session</h2>
          <p className="mb-6 text-sm text-text-muted">{validation.errorMessage}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="rounded-md bg-primary text-white px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:bg-primary-hover focus:outline-none"
            >
              Browse Products
            </button>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="rounded-md border border-border-subtle bg-surface text-text-main px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-page focus:outline-none"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'BUY_NOW' && buyNowError) {
    return (
      <div className="py-16 px-4 bg-page min-h-[60vh] flex items-center justify-center">
        <div className="mx-auto max-w-lg rounded-lg border border-[#B42318]/20 bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#B42318]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-[#B42318]">Unable to Proceed with Buy Now</h2>
          <p className="mb-6 text-sm text-text-muted">{buyNowError}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="rounded-md bg-primary text-white px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:bg-primary-hover focus:outline-none"
            >
              Browse Products
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-md border border-border-subtle bg-surface text-text-main px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-page focus:outline-none"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || (mode === 'BUY_NOW' && buyNowLoading)) {
    return (
      <div className="flex h-64 items-center justify-center bg-page">
        <div className="text-center text-text-muted">
          <div className="mb-4 mx-auto h-8 w-8 animate-spin rounded-full border-4 border-border-subtle border-t-primary"></div>
          <p>{mode === 'BUY_NOW' ? 'Loading Buy Now Item...' : 'Loading Checkout...'}</p>
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
            className="inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentCheckoutItems = mode === 'BUY_NOW'
    ? (buyNowResolvedItem ? [buyNowResolvedItem] : [])
    : (authenticatedCart?.items || []);
  const selectedShippingFee = shippingQuote?.shippingFee || 0;
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' MMK';
  };

  const isCustomFormValid = !!customAddress.recipientName.trim() && 
                            /^\d{11}$/.test(customAddress.phoneNumber.trim()) && 
                            !!customAddress.addressLine1.trim() && 
                            !isCustomLine1Invalid &&
                            !isCustomLine2Invalid &&
                            !!customAddress.regionOrState?.trim() && 
                            !!customAddress.city.trim() &&
                            !!customAddress.township.trim();
  const isBuyNowStockInsufficient = mode === 'BUY_NOW' && (
    !buyNowResolvedItem ||
    !buyNowResolvedItem.available ||
    buyNowResolvedItem.availableQuantity < (validation.buyNowItem?.quantity || 1)
  );

  const isPlaceOrderDisabled = isSubmitting || 
                               isBuyNowStockInsufficient ||
                               (mode === 'CART' && currentCheckoutItems.length === 0) ||
                               (addressMode === 'saved' && !selectedAddressId) || 
                               (addressMode === 'custom' && (!isCustomFormValid || !quotedCustomLocation)) ||
                               shippingLoading || 
                               !!shippingError || 
                               !shippingQuote;

  return (
    <div className="bg-page py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-text-main sm:text-4xl">
          {mode === 'BUY_NOW' ? 'Direct Buy Now Checkout' : 'Checkout'}
        </h1>
        
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
                        <label className="block text-sm font-medium text-text-main">Recipient Name</label>
                        <input type="text" name="recipientName" value={customAddress.recipientName} onChange={handleCustomAddressChange} placeholder="e.g. Khant Thu Zaw" className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text-main">Phone Number</label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          name="phoneNumber"
                          value={customAddress.phoneNumber}
                          onChange={handleCustomAddressChange}
                          placeholder="e.g. 09123456789"
                          maxLength={11}
                          className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text-main">Address Line 1</label>
                        <input 
                          type="text" 
                          name="addressLine1" 
                          value={customAddress.addressLine1} 
                          onChange={handleCustomAddressChange} 
                          className={`mt-1 block w-full rounded-md border ${isCustomLine1Invalid ? 'border-[#B42318] focus:border-[#B42318]' : 'border-border-subtle focus:border-primary'} bg-page px-3 py-2 text-sm focus:outline-none`} 
                        />
                        {isCustomLine1Invalid && (
                          <p className="text-xs text-[#B42318] mt-1 font-medium">
                            Township is not allowed here. Please select it from the dropdown below.
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text-main">Address Line 2</label>
                        <input 
                          type="text" 
                          name="addressLine2" 
                          value={customAddress.addressLine2} 
                          onChange={handleCustomAddressChange} 
                          className={`mt-1 block w-full rounded-md border ${isCustomLine2Invalid ? 'border-[#B42318] focus:border-[#B42318]' : 'border-border-subtle focus:border-primary'} bg-page px-3 py-2 text-sm focus:outline-none`} 
                        />
                        {isCustomLine2Invalid && (
                          <p className="text-xs text-[#B42318] mt-1 font-medium">
                            Township is not allowed here. Please select it from the dropdown below.
                          </p>
                        )}
                      </div>

                      {/* Region/State Select Field (First) */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-text-main">Region / State</label>
                        <select 
                          name="regionOrState" 
                          value={customAddress.regionOrState} 
                          onChange={handleCustomRegionChange} 
                          disabled={zonesLoading || !regions || regions.length === 0}
                          className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                        >
                          <option value="" disabled>Select Region / State</option>
                          {regions?.map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </div>

                      {/* City/District Select Field (Second) */}
                      <div>
                        <label className="block text-sm font-medium text-text-main">City / District</label>
                        <select 
                          name="city" 
                          value={customAddress.city} 
                          onChange={handleCustomCityChange} 
                          disabled={zonesLoading || !customAddress.regionOrState || getCitiesForRegion(customAddress.regionOrState).length === 0}
                          className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                        >
                          <option value="" disabled>Select City / District</option>
                          {customAddress.regionOrState && getCitiesForRegion(customAddress.regionOrState).map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Township Select Field (Third) */}
                      <div>
                        <label className="block text-sm font-medium text-text-main">Township</label>
                        <select 
                          name="township" 
                          value={customAddress.township} 
                          onChange={handleCustomTownshipChange} 
                          disabled={zonesLoading || !customAddress.city || getTownshipsForCity(customAddress.city, customAddress.regionOrState).length === 0}
                          className="mt-1 block w-full rounded-md border border-border-subtle bg-page px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                        >
                          <option value="" disabled>Select Township</option>
                          {customAddress.city && getTownshipsForCity(customAddress.city, customAddress.regionOrState).map(township => (
                            <option key={township} value={township}>{township}</option>
                          ))}
                        </select>
                      </div>
                      
                      {!zonesLoading && (!regions || regions.length === 0) && (
                        <div className="sm:col-span-2 mt-2 text-sm text-[#B42318]">
                          Delivery locations are currently unavailable.
                        </div>
                      )}
                      
                      <div className="sm:col-span-2 mt-2">
                        <button 
                          type="button" 
                          onClick={handleCheckCustomDelivery} 
                          disabled={shippingLoading || !customAddress.city.trim() || !customAddress.township.trim()}
                          className="w-full sm:w-auto rounded-md bg-accent text-slate-950 px-4 py-2 text-sm font-bold shadow-sm hover:bg-accent-hover focus:outline-none disabled:opacity-50 transition-colors"
                        >
                          {shippingLoading ? 'Checking...' : 'Check Delivery'}
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
            {mode === 'BUY_NOW' && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-text-muted space-y-2">
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                  <span>Direct Buy Now Mode</span>
                </div>
                <p>
                  You are checking out only this selected item. Your shopping cart items remain intact and are not included in this purchase.
                </p>
                <div className="border-t border-border-subtle pt-2 text-[11px] text-text-muted">
                  <strong>Estimated Pricing:</strong> Catalog prices shown. Final authoritative totals and shipping charges will be verified on backend order creation.
                </div>
              </div>
            )}

            <OrderSummary 
              cartItems={currentCheckoutItems} 
              shippingFee={selectedShippingFee} 
            />
            
            <div className="rounded-lg border border-border-subtle bg-surface px-4 py-6 shadow-sm sm:p-6">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlaceOrderDisabled}
                className="w-full rounded-md bg-primary text-white px-4 py-4 text-base font-bold shadow-md transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-border-subtle disabled:text-text-muted"
              >
                {isSubmitting ? 'Creating Order...' : (mode === 'BUY_NOW' ? 'Place Buy Now Order' : 'Place Order')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};