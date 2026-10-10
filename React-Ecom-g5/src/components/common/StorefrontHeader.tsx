import { BrandLogo } from './BrandLogo';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout } from '../../features/auth/store/authSlice';
import { useProductSearch } from '../../features/product/hooks/useProductSearch';
import { searchHistoryApi } from '../../features/product/api/searchHistoryApi';
import { productApi } from '../../features/product/api/productApi';
import type { RecentSearchResponse, ProductListResponse } from '../../features/product/types';
import { getAssetUrl } from '../../utils/assetUtils';

export const StorefrontHeader: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, customer } = useAppSelector((state) => state.auth);
  const { authenticatedCart, guestItems } = useAppSelector((state) => state.cart);
  const cartCount = isAuthenticated ? (authenticatedCart?.totalQuantity || 0) : guestItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const urlSearch = searchParams.get('search') || '';
  
  // Local state for the input box ONLY. Does NOT update URL immediately.
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState<RecentSearchResponse[]>([]);
  const [trendingSuggestions, setTrendingSuggestions] = useState<ProductListResponse[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  const { executeSearch } = useProductSearch();
  
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Update input only when URL actually changes (e.g., from external link)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setIsAccountMenuOpen(false);
      }
      if (
        (desktopSearchRef.current && !desktopSearchRef.current.contains(target)) &&
        (mobileSearchRef.current && !mobileSearchRef.current.contains(target))
      ) {
        setIsSearchDropdownOpen(false);
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        setIsSearchDropdownOpen(false);
      }
    };

    if (isAccountMenuOpen || isSearchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountMenuOpen, isSearchDropdownOpen]);

  const handleSearchFocus = async () => {
    setIsSearchDropdownOpen(true);
    try {
      if (isAuthenticated && searchInput.trim() === '') {
        const recent = await searchHistoryApi.getRecentSearches().catch(e => { console.error(e); return [] as RecentSearchResponse[]; });
        setRecentSearches(recent);
      }
    } catch (err) {
      console.error('Failed to load recent searches:', err);
    }
  };

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === '') {
      setTrendingSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    let isMounted = true;
    setSuggestionsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await productApi.getTrendingSuggestions(trimmed);
        if (isMounted) {
          setTrendingSuggestions(data);
        }
      } catch (err) {
        console.error('Failed to fetch trending suggestions:', err);
      } finally {
        if (isMounted) {
          setSuggestionsLoading(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchInput]);

  const handleKeywordClick = (keyword: string) => {
    setSearchInput(keyword);
    setIsSearchDropdownOpen(false);
    executeSearch(keyword);
  };

  // Handle Search Submission (Enter or Click)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchDropdownOpen(false);
    const trimmed = searchInput.trim();
    
    // Only navigate and update URL parameter if submitted
    if (trimmed) {
      executeSearch(trimmed);
    } else {
      navigate('/products');
    }
  };

  const handleDeleteRecentSearch = async (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await searchHistoryApi.deleteSearch(keyword);
      setRecentSearches(prev => prev.filter(r => r.keyword !== keyword));
    } catch (err) {
      console.error('Failed to delete search history item:', err);
    }
  };

  const handleClearAllSearches = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await searchHistoryApi.clearSearchHistory();
      setRecentSearches([]);
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  };

  const handleProductSuggestionClick = (productId: number) => {
    setIsSearchDropdownOpen(false);
    navigate(`/products/${productId}`);
  };

  const renderSearchDropdown = () => {
    if (!isSearchDropdownOpen) return null;
    
    const trimmed = searchInput.trim();
    const showRecent = trimmed === '' && isAuthenticated && recentSearches.length > 0;
    const showSuggestions = trimmed !== '';

    if (!showRecent && !showSuggestions) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-border-subtle z-50 overflow-hidden">
        {showRecent && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Recent Searches</h3>
              <button
                type="button"
                onClick={handleClearAllSearches}
                className="text-[11px] font-medium text-primary hover:text-primary-hover focus:outline-none"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-col">
              {recentSearches.map((r, i) => (
                <div key={`recent-${i}`} className="flex items-center group rounded hover:bg-page transition-colors">
                  <button
                    type="button"
                    onClick={() => handleKeywordClick(r.keyword)}
                    className="flex-1 text-left px-2 py-1.5 text-sm font-medium text-text-main flex items-center gap-2 focus:outline-none"
                  >
                    <svg className="w-4 h-4 text-text-muted opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {r.keyword}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteRecentSearch(e, r.keyword)}
                    aria-label={`Delete recent search ${r.keyword}`}
                    className="px-2 py-1.5 text-text-muted hover:text-danger focus:outline-none opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showSuggestions && (
          <div className="p-3">
            <h3 className="text-[11px] font-bold text-text-muted uppercase mb-3 px-1 tracking-wider">Product Suggestions</h3>
            {suggestionsLoading ? (
              <div className="px-2 py-3 text-sm text-text-muted flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : trendingSuggestions.length > 0 ? (
              <div className="flex flex-col gap-1">
                {trendingSuggestions.map((product) => {
                  const imageUrl = getAssetUrl(product.primaryImageUrl);
                  return (
                    <button
                      key={product.productId}
                      type="button"
                      onClick={() => handleProductSuggestionClick(product.productId)}
                      className="text-left px-2 py-2 hover:bg-page rounded flex items-center gap-3 transition-colors focus:outline-none focus:bg-page"
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-white border border-border-subtle rounded flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.productName} className="w-full h-full object-contain" />
                        ) : (
                          <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm10 10H8v-2h8v2zm0-4H8v-2h8v2z"/></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-main truncate">{product.productName}</div>
                        <div className="text-xs text-primary font-bold mt-0.5">
                          {product.startingPrice ? `From ${product.startingPrice} MMK` : 'Price Varies'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-2 py-3 text-sm text-text-muted text-center">No trending suggestions</div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const handleLogout = () => {
    dispatch(logout());
    setIsAccountMenuOpen(false);
    setRecentSearches([]);
    navigate('/products');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] text-white shadow-md print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="flex items-center justify-between gap-4 md:gap-8 mb-4">
          <div className="flex-shrink-0">
            <Link to="/" className="block focus:outline-none focus:ring-2 focus:ring-primary rounded" aria-label="6Sync Home">
              <BrandLogo theme="light" />
            </Link>
          </div>

          <div className="hidden flex-1 max-w-2xl sm:block" ref={desktopSearchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <label htmlFor="global-search" className="sr-only">Search products</label>
              <input
                id="global-search"
                type="text"
                value={searchInput}
                onFocus={handleSearchFocus}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products or SKU..."
                // border-[#EF4444] ထည့်သွင်းပြီး အနီရောင်ဘောင်သတ်မှတ်ထားပါသည်
                className="w-full rounded-full border border-[#EF4444] bg-white py-2.5 pl-5 pr-11 text-sm text-text-main placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute inset-y-1.5 right-1.5 flex items-center justify-center w-8 h-6 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors focus:outline-none shadow-xs"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {renderSearchDropdown()}
            </form>
          </div>

          <div className="flex flex-shrink-0 items-center space-x-5">
            {isAuthenticated ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 text-[#000000] transition-colors hover:text-[#475569] focus:outline-none font-medium"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                >
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="hidden text-sm font-medium sm:block max-w-[120px] truncate">{customer?.fullName}</span>
                </button>
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-surface py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border-subtle">
                    <div className="px-4 py-2 border-b border-border-subtle">
                      <p className="text-sm font-medium text-text-main truncate">{customer?.fullName}</p>
                      <p className="text-xs text-text-muted truncate">{customer?.email}</p>
                    </div>
                    <Link to="/orders" className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-page hover:text-primary transition-colors" onClick={() => setIsAccountMenuOpen(false)}>My Orders</Link>
                    <Link to="/refunds" className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-page hover:text-primary transition-colors" onClick={() => setIsAccountMenuOpen(false)}>My Refunds</Link>
                    <Link to="/profile" className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-page hover:text-primary transition-colors" onClick={() => setIsAccountMenuOpen(false)}>My Profile</Link>
                    <button type="button" onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-page hover:text-primary transition-colors">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-[#EF4444] transition-colors hover:text-[#475569] focus:outline-none">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            )}

            <Link to="/cart" className="text-[#EF4444] transition-colors hover:text-[#475569] focus:outline-none">
              <div className="relative">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
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

        {/* Mobile Search */}
        <div className="mb-4 sm:hidden" ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchInput}
              onFocus={handleSearchFocus}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products or SKU..."
              // border-[#EF4444] ထည့်သွင်းပြီး အနီရောင်ဘောင်သတ်မှတ်ထားပါသည်
              className="w-full rounded-full border border-[#EF4444] bg-white py-2 pl-4 pr-11 text-sm text-text-main placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
            />
            <button
              type="submit"
              className="absolute inset-y-1 right-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors focus:outline-none shadow-xs"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {renderSearchDropdown()}
          </form>
        </div>
   
       <nav className="hidden sm:block pb-4">
        <div className="mx-auto w-full"> 
          {/* border border-[#EF4444] ထည့်သွင်းပြီး အနီရောင်ဘောင်သတ်မှတ်ထားပါသည် */}
          <div className="bg-[#FFFFFF] border border-[#EF4444] text-[#1E293B] rounded-lg shadow-sm">
            <ul className="flex h-10 justify-center items-center gap-6 px-4 text-sm font-bold tracking-wider">
              <li>
                <Link to="/" className="relative px-5 py-2.5 rounded-full overflow-hidden group transition-all duration-200 active:scale-95 block">
                  <span className="relative z-10 group-hover:text-[#FFFFFF]">HOME</span>
                  <span className="absolute inset-0 bg-[#1589FF] rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out z-0"></span>
                </Link>
              </li>
              <li>
                <Link to="/products" className="relative px-5 py-2.5 rounded-full overflow-hidden group transition-all duration-200 active:scale-95 block">
                  <span className="relative z-10 group-hover:text-[#FFFFFF]">PRODUCTS</span>
                  <span className="absolute inset-0 bg-[#1589FF] rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out z-0"></span>
                </Link>
              </li>
              <li>
                <Link to="/categories" className="relative px-5 py-2.5 rounded-full overflow-hidden group transition-all duration-200 active:scale-95 block">
                  <span className="relative z-10 group-hover:text-[#FFFFFF]">CATEGORIES</span>
                  <span className="absolute inset-0 bg-[#1589FF] rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out z-0"></span>
                </Link>
              </li>
              <li>
                <Link to="/brands" className="relative px-5 py-2.5 rounded-full overflow-hidden group transition-all duration-200 active:scale-95 block">
                  <span className="relative z-10 group-hover:text-[#FFFFFF]">BRANDS</span>
                  <span className="absolute inset-0 bg-[#1589FF] rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out z-0"></span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
        
      </div>
    </header>
  );
};