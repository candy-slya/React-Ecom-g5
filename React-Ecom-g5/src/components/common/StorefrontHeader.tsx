import { BrandLogo } from './BrandLogo';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout } from '../../features/auth/store/authSlice';

export const StorefrontHeader: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, customer } = useAppSelector((state) => state.auth);
  const { authenticatedCart, guestItems } = useAppSelector((state) => state.cart);
  const cartCount = isAuthenticated ? (authenticatedCart?.totalQuantity || 0) : guestItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const urlSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    
    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };

    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/products');
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
    setIsAccountMenuOpen(false);
    navigate('/products');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#FFC700] via-[#FFD000] to-[#FFBF00] text-text-main shadow-md print:hidden">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 md:gap-8">
          
          <div className="flex-shrink-0">
            <Link to="/" className="block focus:outline-none focus:ring-2 focus:ring-primary rounded" aria-label="6Sync Home">
              <BrandLogo theme="light" />
            </Link>
          </div>

          <div className="hidden flex-1 max-w-2xl sm:block">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <label htmlFor="global-search" className="sr-only">Search products</label>
              <input
                id="global-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products or SKU..."
                className="w-full rounded-full border-0 bg-white py-2 pl-4 pr-11 text-sm text-text-main placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute inset-y-1 right-1.5 flex items-center justify-center w-8 h-8 my-auto rounded-full bg-primary text-white hover:bg-primary-hover transition-colors focus:outline-none shadow-xs"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          <div className="flex flex-shrink-0 items-center space-x-4">
            
            {/* Account Area */}
            {isAuthenticated ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 text-text-main transition-colors hover:text-primary focus:outline-none font-medium"
                  aria-label="Account menu"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="hidden text-sm font-medium sm:block max-w-[120px] truncate">
                    {customer?.fullName}
                  </span>
                </button>
                
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-surface py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border-subtle">
                    <div className="px-4 py-2 border-b border-border-subtle">
                      <p className="text-sm font-medium text-text-main truncate">{customer?.fullName}</p>
                      <p className="text-xs text-text-muted truncate">{customer?.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-page hover:text-primary transition-colors"
                      onClick={() => setIsAccountMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/refunds"
                      className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-page hover:text-primary transition-colors"
                      onClick={() => setIsAccountMenuOpen(false)}
                    >
                      My Refunds
                    </Link>
                    <Link
                      to="/profile"
                      className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-page hover:text-primary transition-colors"
                      onClick={() => setIsAccountMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-page hover:text-primary transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-text-main transition-colors hover:text-primary focus:outline-none"
                aria-label="Account login"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            )}

            <Link
              to="/cart"
              className="text-text-main transition-colors hover:text-primary focus:outline-none"
              aria-label="Cart"
            >
              <div className="relative">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-xs">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>

        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <label htmlFor="mobile-global-search" className="sr-only">Search products</label>
            <input
              id="mobile-global-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products or SKU..."
              className="w-full rounded-full border-0 bg-white py-2 pl-4 pr-11 text-sm text-text-main placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute inset-y-1 right-1.5 flex items-center justify-center w-8 h-8 my-auto rounded-full bg-primary text-white hover:bg-primary-hover transition-colors focus:outline-none shadow-xs"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    
      <nav className="hidden sm:block pb-2 border-t border-black/0">
  <div className="mx-auto max-w-15x1 px-6 sm:px-20 lg:px-8">
    <div className="bg-[#0F172A] text-white rounded-md px-10 shadow-sm">
      {/* h-10, text-xs နှင့် gap-4 သို့ ပြင်ဆင်ထားပါသည် */}
      <ul className="flex h-10 items-center gap-10 text-xs font-bold tracking-wider">
        <li>
          {/* Hover အဝိုင်းလေး ဘောင်နှင့်ညီအောင် px-4 py-1.5 သို့ ပြင်ပေးထားပါသည် */}
          <Link to="/" className="relative px-4 py-1.5 rounded-full overflow-hidden group text-white transition-all duration-200 active:scale-95 block">
            <span className="relative z-10 group-hover:text-white">HOME</span>
            <span className="absolute inset-0 bg-[#1589FF] rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out z-0"></span>
          </Link>
        </li>
        <li>
          <Link to="/products" className="relative px-4 py-1.5 rounded-full overflow-hidden group text-white transition-all duration-200 active:scale-95 block">
            <span className="relative z-10 group-hover:text-white">PRODUCTS</span>
            <span className="absolute inset-0 bg-[#1589FF] rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out z-0"></span>
          </Link>
        </li>
        <li>
          <Link to="/categories" className="relative px-4 py-1.5 rounded-full overflow-hidden group text-white transition-all duration-200 active:scale-95 block">
            <span className="relative z-10 group-hover:text-white">CATEGORIES</span>
            <span className="absolute inset-0 bg-[#1589FF] rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out z-0"></span>
          </Link>
        </li>
        <li>
          <Link to="/brands" className="relative px-4 py-1.5 rounded-full overflow-hidden group text-white transition-all duration-200 active:scale-95 block">
            <span className="relative z-10 group-hover:text-white">BRANDS</span>
            <span className="absolute inset-0 bg-[#1589FF] rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out z-0"></span>
          </Link>
        </li>
      </ul>
    </div>
  </div>
</nav>
    </header>
  );
};
