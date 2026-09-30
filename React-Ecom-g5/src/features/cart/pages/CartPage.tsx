import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import {
  fetchAuthenticatedCart,
  resolveGuestCartAsync,
  setGuestItemQuantity,
  removeGuestItem,
  updateAuthenticatedCartItemQuantity,
  removeAuthenticatedCartItem,
} from '../store/cartSlice';
import { CartItemComponent } from '../components/CartItemComponent';

export const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);
  const {
    guestItems,
    resolvedGuestCart,
    authenticatedCart,
    loading,
    error,
  } = useAppSelector((state) => state.cart);

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitializing) return;

    if (isAuthenticated) {
      dispatch(fetchAuthenticatedCart());
    } else {
      dispatch(resolveGuestCartAsync());
    }
  }, [isAuthenticated, isInitializing, dispatch, guestItems.length]); // depend on guestItems.length for initial guest load if it changes outside, but typically we want it on mount or auth change

  const handleCheckoutNavigation = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=/checkout");
    }
  };
  const handleRetry = () => {
    if (isAuthenticated) {
      dispatch(fetchAuthenticatedCart());
    } else {
      dispatch(resolveGuestCartAsync());
    }
  };

  const handleQuantityChange = async (id: number, quantity: number) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      if (isAuthenticated) {
        const resultAction = await dispatch(updateAuthenticatedCartItemQuantity({ cartItemId: id, quantity }));
        if (updateAuthenticatedCartItemQuantity.rejected.match(resultAction)) {
          setUpdateError(resultAction.payload as string);
        }
      } else {
        dispatch(setGuestItemQuantity({ variantId: id, quantity }));
        await dispatch(resolveGuestCartAsync());
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async (id: number) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      if (isAuthenticated) {
        const resultAction = await dispatch(removeAuthenticatedCartItem(id));
        if (removeAuthenticatedCartItem.rejected.match(resultAction)) {
          setUpdateError(resultAction.payload as string);
        }
      } else {
        dispatch(removeGuestItem(id));
        await dispatch(resolveGuestCartAsync());
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex h-64 items-center justify-center bg-page">
        <div className="text-center text-text-muted">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border-subtle border-t-primary mx-auto"></div>
          <p>Loading Cart...</p>
        </div>
      </div>
    );
  }

  // Determine current active display data
  const currentItems = isAuthenticated
    ? authenticatedCart?.items || []
    : resolvedGuestCart?.items || [];
    
  const totalQuantity = isAuthenticated
    ? authenticatedCart?.totalQuantity || 0
    : resolvedGuestCart?.totalQuantity || 0;
    
  const totalAmount = isAuthenticated
    ? authenticatedCart?.totalAmount || 0
    : resolvedGuestCart?.totalAmount || 0;

  // Wait for initial load
  const isDataMissing = isAuthenticated ? !authenticatedCart : !resolvedGuestCart;

  if (loading && isDataMissing) {
    return (
      <div className="flex h-64 items-center justify-center bg-page">
        <div className="text-center text-text-muted">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border-subtle border-t-primary mx-auto"></div>
          <p>Loading Cart Details...</p>
        </div>
      </div>
    );
  }

  if (error && isDataMissing) {
    return (
      <div className="py-16 px-4">
        <div className="mx-auto max-w-2xl rounded-lg border border-[#B42318]/20 bg-surface p-6 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-[#B42318]">Error Loading Cart</h2>
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

  if (currentItems.length === 0) {
    return (
      <div className="bg-page py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-text-main sm:text-4xl">Shopping Cart</h1>
          <div className="mt-12 rounded-lg border border-border-subtle bg-surface p-12 shadow-sm">
            <svg className="mx-auto h-16 w-16 text-text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-medium text-text-main mb-6">Your cart is empty.</h2>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-base font-bold shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' MMK';
  };

  const hasUnavailableItems = currentItems.some((item) => !item.available);

  return (
    <div className="bg-page py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-text-main sm:text-4xl">Shopping Cart</h1>
        
        {updateError && (
          <div className="mb-6 rounded-md bg-[#B42318]/10 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-[#B42318]">Update Failed</h3>
                <div className="mt-2 text-sm text-[#B42318]">
                  <p>{updateError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          
          <div className="lg:col-span-8">
            <div className="rounded-lg border border-border-subtle bg-surface shadow-sm">
              <div className="divide-y divide-border-subtle px-4 sm:px-6">
                {currentItems.map((item, index) => (
                  <CartItemComponent
                    key={isAuthenticated ? (item as any).cartItemId : (item as any).variantId + '-' + index}
                    item={item}
                    isAuthenticated={isAuthenticated}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                    isUpdating={isUpdating || loading}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 lg:col-span-4 lg:mt-0">
            <div className="rounded-lg border border-border-subtle bg-surface px-4 py-6 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-text-main mb-6">Order Summary</h2>
              
              <div className="flow-root">
                <dl className="-my-4 divide-y divide-border-subtle text-sm">
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-text-muted">Total Items</dt>
                    <dd className="font-medium text-text-main">{totalQuantity}</dd>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-base font-bold text-text-main">Order Total</dt>
                    <dd className="text-xl font-bold text-text-main">{formatPrice(totalAmount)}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleCheckoutNavigation}
                  type="button"
                  disabled={hasUnavailableItems || isUpdating || loading}
                  className="w-full rounded-md bg-primary text-white px-4 py-4 text-base font-bold shadow-md transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-border-subtle disabled:text-text-muted"
                >
                  Proceed to Checkout
                </button>
                {hasUnavailableItems && (
                  <p className="mt-3 text-center text-sm text-[#B42318]">
                    Please remove or update unavailable items to checkout.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
