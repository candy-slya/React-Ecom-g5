import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { ProductCard } from '../../../components/product/ProductCard';
import type { BrandResponse } from '../api/productApi';
import type { CategoryNodeResponse, ProductListResponse } from '../types';
import { getAssetUrl } from '../../../utils/assetUtils';
import { CategoryCard } from '../../../components/category/CategoryCard';
import { PopularSearchesHomeSection } from '../components/PopularSearchesHomeSection';
import { GeometricPatternBanner } from '../../../components/common/GeometricPatternBanner';
import { defaultHeroBanners, defaultPromoBanner } from '../data/homeBanners';

// Brand Card Component
const BrandCard: React.FC<{ brand: BrandResponse; onClick: () => void }> = ({ brand, onClick }) => {
  const [hasError, setHasError] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const logoUrl = getAssetUrl(brand.brandLogoUrl);
  const showImage = Boolean(logoUrl) && !hasError;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      setIsWide(ratio > 1.35 || ratio < 0.65);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-border-subtle rounded-2xl p-4 sm:p-5 text-center cursor-pointer hover:-translate-y-1.5 hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between group"
    >
      <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto border-2 border-border-subtle bg-white rounded-full flex items-center justify-center font-black text-xs mb-3 overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-300 ${isWide ? 'p-2' : 'p-0'}`}>
        {showImage ? (
          <img
            src={logoUrl}
            alt={brand.brandName}
            onLoad={handleImageLoad}
            onError={() => setHasError(true)}
            className={`w-full h-full rounded-full transition-all ${
              isWide ? 'object-contain' : 'object-cover'
            }`}
          />
        ) : (
          <span className="text-xs font-black text-text-main uppercase tracking-wider text-center line-clamp-2 px-1">
            {brand.brandName}
          </span>
        )}
      </div>
      <b className="text-sm font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">{brand.brandName}</b>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // API Data States
  const [categories, setCategories] = useState<CategoryNodeResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductListResponse[]>([]);
  const [promoProducts, setPromoProducts] = useState<ProductListResponse[]>([]);

  // 1. Top Hero Banner Slider State (5 Images, 5s rotate)
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // 2. Browse Categories Slider State (3 categories per view, 5s rotate)
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);
  const CATEGORIES_PER_PAGE = 3;

  // 3. Shop by Brand Slider State (6 brands per view, 5s rotate)
  const [currentBrandPage, setCurrentBrandPage] = useState(0);
  const [isBrandHovered, setIsBrandHovered] = useState(false);
  const BRANDS_PER_PAGE = 6;

  // 4. "Hello My Friend" 3-Slide Promotional Banner State (5s rotate)
  const [currentOldSlide, setCurrentOldSlide] = useState(0);

  // Welcome Popup States
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch Initial Data
  useEffect(() => {
    // Categories
    productApi.getCategoryTree().then(setCategories).catch(console.error);

    // Active Brands
    productApi.getActiveBrands().then((res) => {
      const sorted = [...res].sort((a, b) =>
        (a.brandName || '').localeCompare(b.brandName || '', undefined, { sensitivity: 'base' })
      );
      setBrands(sorted);
    }).catch(console.error);

    // Best Sellers
    productApi.getBestSellers().then((res) => setBestSellers(res.content)).catch(console.error);

    // Promo / Trending Products (for Promo Banner side-by-side section)
    productApi.getTrendingProducts(0, 3)
      .then((res) => {
        if (res.content && res.content.length > 0) {
          setPromoProducts(res.content);
        } else {
          productApi.getProducts({ size: 3 }).then((p) => setPromoProducts(p.content)).catch(console.error);
        }
      })
      .catch(() => {
        productApi.getProducts({ size: 3 }).then((p) => setPromoProducts(p.content)).catch(console.error);
      });
  }, []);

  // -------------------------------------------------------------
  // Timers: Auto-play rotations (5 seconds each)
  // -------------------------------------------------------------

  // 1. Top Hero Banner (5 slides)
  useEffect(() => {
    if (isHeroHovered || defaultHeroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % defaultHeroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  // 2. Browse Categories (3 categories per view)
  const totalCategoryPages = Math.max(1, Math.ceil(categories.length / CATEGORIES_PER_PAGE));
  useEffect(() => {
    if (isCategoryHovered || totalCategoryPages <= 1) return;
    const timer = setInterval(() => {
      setCurrentCategoryPage((prev) => (prev + 1) % totalCategoryPages);
    }, 5000);
    return () => clearInterval(timer);
  }, [isCategoryHovered, totalCategoryPages]);

  // 3. Shop by Brand (6 brands per view)
  const totalBrandPages = Math.max(1, Math.ceil(brands.length / BRANDS_PER_PAGE));
  useEffect(() => {
    if (isBrandHovered || totalBrandPages <= 1) return;
    const timer = setInterval(() => {
      setCurrentBrandPage((prev) => (prev + 1) % totalBrandPages);
    }, 5000);
    return () => clearInterval(timer);
  }, [isBrandHovered, totalBrandPages]);

  // 4. "Hello My Friend" 3-Slide Hero Banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOldSlide((prev) => (prev === 2 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Welcome Popup Smooth Transition Logic
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    let mountTimer: ReturnType<typeof setTimeout>;
    let visibleTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let unmountTimer: ReturnType<typeof setTimeout>;

    if (!hasSeenWelcome) {
      mountTimer = setTimeout(() => {
        setIsMounted(true);
        visibleTimer = setTimeout(() => {
          setIsVisible(true);
        }, 50);

        hideTimer = setTimeout(() => {
          setIsVisible(false);
          unmountTimer = setTimeout(() => {
            setIsMounted(false);
            sessionStorage.setItem('hasSeenWelcome', 'true');
          }, 1000);
        }, 5050);
      }, 1500);
    }

    return () => {
      if (mountTimer) clearTimeout(mountTimer);
      if (visibleTimer) clearTimeout(visibleTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (unmountTimer) clearTimeout(unmountTimer);
    };
  }, []);

  const handleCloseWelcome = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsMounted(false);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }, 1000);
  };

  const routeProducts = (params?: Record<string, any>) => {
    const q = new URLSearchParams(params).toString();
    navigate(`/products${q ? '?' + q : ''}`);
  };

  // Original 3-slide promotional content
  const originalHeroSlides = [
    {
      badge: "6SYNC COLLECTION",
      title: <>Discover Products<br/>Made for Your Day.</>,
      description: "Discover products by category and brand, then compare variants and live available stock.",
      btnText: "SHOP NOW",
      action: () => routeProducts()
    },
    {
      badge: "NEW ARRIVALS",
      title: <>Elevate Your Style<br/>With Latest Trends.</>,
      description: "Explore our newest collection of premium items carefully curated just for you.",
      btnText: "SHOP NOW",
      action: () => routeProducts({ sort: 'createdAt,desc' })
    },
    {
      badge: "LIMITED OFFERS",
      title: <>HELLO MY FRIEND!<br/>HAVE A NICE DAY</>,
      description: "Get the best prices on top brands. Shop now before the stock runs out.",
      btnText: "SHOP NOW",
      action: () => routeProducts({ tags: ['SALE'] })
    }
  ];

  // Visible Categories slice (3 per page)
  const visibleCategories = categories.slice(
    currentCategoryPage * CATEGORIES_PER_PAGE,
    (currentCategoryPage + 1) * CATEGORIES_PER_PAGE
  );

  // Visible Brands slice (6 per page)
  const visibleBrands = brands.slice(
    currentBrandPage * BRANDS_PER_PAGE,
    (currentBrandPage + 1) * BRANDS_PER_PAGE
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative">

      {/* ============================================================== */}
      {/* 1. TOP HERO BANNER SLIDER (Auto-Rotate Every 5s)               */}
      {/* ============================================================== */}
      <section 
        className="relative rounded-2xl overflow-hidden h-[230px] sm:h-[340px] md:h-[420px] lg:h-[480px] xl:h-[520px] mb-12 shadow-xl group bg-slate-950 select-none"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        {/* Slides */}
        <div className="relative w-full h-full">
          {defaultHeroBanners.map((slide, index) => {
            const isActive = index === (currentHeroSlide % defaultHeroBanners.length);
            const fitMode = slide.objectFit || 'cover';

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
                onClick={() => navigate(slide.linkUrl)}
              >
                {/* 1. Ambient Blurred Backdrop: creates smooth, color-matched glow for any aspect ratio */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img
                    src={slide.imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover filter blur-2xl scale-125 opacity-30 brightness-75 select-none"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* 2. Foreground Crisp Banner Image */}
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  className={`relative z-10 w-full h-full ${
                    fitMode === 'contain' ? 'object-contain' : 'object-cover'
                  } object-center transition-transform duration-700 group-hover:scale-[1.01]`}
                />

                {/* 3. Optional Left Text Overlay (only shown if showText is explicitly enabled) */}
                {slide.showText === true && (
                  <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent flex items-center px-6 sm:px-12 lg:px-16">
                    <div className="max-w-xl text-white py-6">
                      {slide.badge && (
                        <span className="inline-block bg-primary text-white text-[11px] sm:text-xs font-black tracking-widest px-3.5 py-1.5 rounded-full uppercase mb-3 sm:mb-4 shadow-md">
                          {slide.badge}
                        </span>
                      )}
                      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-sm mb-3">
                        {slide.title}
                      </h1>
                      {slide.subtitle && (
                        <p className="text-white/90 text-sm sm:text-base leading-relaxed font-normal mb-6 max-w-md line-clamp-2 sm:line-clamp-3">
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.btnText && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(slide.linkUrl);
                          }}
                          className="bg-primary hover:bg-primary-hover text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                        >
                          <span>{slide.btnText}</span>
                          <span>&rarr;</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Previous Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentHeroSlide((prev) => (prev === 0 ? defaultHeroBanners.length - 1 : prev - 1));
          }}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-20 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-lg hover:scale-105"
          aria-label="Previous Banner"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentHeroSlide((prev) => (prev + 1) % defaultHeroBanners.length);
          }}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-20 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-lg hover:scale-105"
          aria-label="Next Banner"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Bottom Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full">
          {defaultHeroBanners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentHeroSlide(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === (currentHeroSlide % defaultHeroBanners.length)
                  ? 'w-7 bg-primary'
                  : 'w-2 bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter (01 / 05) */}
        <div className="absolute bottom-4 right-6 text-xs font-bold text-white/80 tracking-widest z-20 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full hidden sm:block">
          {String((currentHeroSlide % defaultHeroBanners.length) + 1).padStart(2, '0')} / {String(defaultHeroBanners.length).padStart(2, '0')}
        </div>
      </section>


      {/* ============================================================== */}
      {/* 2. BROWSE CATEGORIES (3 Categories per View, 5s Auto-Rotate)   */}
      {/* ============================================================== */}
      <section 
        className="mb-14"
        onMouseEnter={() => setIsCategoryHovered(true)}
        onMouseLeave={() => setIsCategoryHovered(false)}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
              <h2 className="text-2xl font-black text-text-main tracking-tight">Browse Categories</h2>
            </div>
            <p className="text-sm text-text-muted">
              Choose a department and explore its curated product collection
            </p>
          </div>

          {/* Controls & View All */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setCurrentCategoryPage((prev) => (prev === 0 ? totalCategoryPages - 1 : prev - 1))}
                className="w-8 h-8 rounded-lg bg-white shadow-xs hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                aria-label="Previous Categories"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs font-bold text-slate-500 px-2">
                {String(currentCategoryPage + 1).padStart(2, '0')} / {String(totalCategoryPages).padStart(2, '0')}
              </span>
              <button
                onClick={() => setCurrentCategoryPage((prev) => (prev + 1) % totalCategoryPages)}
                className="w-8 h-8 rounded-lg bg-white shadow-xs hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                aria-label="Next Categories"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <Link to="/categories" className="text-xs sm:text-sm text-primary font-bold hover:underline whitespace-nowrap">
              VIEW ALL CATEGORIES &rarr;
            </Link>
          </div>
        </div>

        {/* 3 Categories Container with smooth transition */}
        <div className="transition-all duration-500 ease-in-out">
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {visibleCategories.map((c) => (
                <CategoryCard
                  key={c.categoryId}
                  category={c}
                  onClick={() => navigate(`/categories/${c.categoryId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* Categories Page Indicator Dots */}
        {totalCategoryPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-5">
            {Array.from({ length: totalCategoryPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentCategoryPage(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentCategoryPage ? 'w-6 bg-primary' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Category page ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>


      {/* ============================================================== */}
      {/* 3. PROMO BANNER + RELATED PRODUCTS SECTION                     */}
      {/* ============================================================== */}
      <section className="mb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Expanded Promo Banner Card (Takes 50% width up to center of page) */}
          <div 
            onClick={() => navigate(defaultPromoBanner.linkUrl || '/products')}
            className="lg:col-span-6 rounded-3xl overflow-hidden relative cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[380px] sm:min-h-[440px] bg-slate-900 border border-slate-800"
          >
            {/* Promo Background Graphic / Image */}
            <img
              src={defaultPromoBanner.imageUrl}
              alt={defaultPromoBanner.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Gradient Overlay for Text Clarity without overlap */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />

            {/* Top Badge */}
            <div className="relative z-20 p-6 sm:p-8">
              <span className="inline-block bg-accent text-slate-900 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                {defaultPromoBanner.badge}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-20 p-6 sm:p-8 text-white max-w-lg">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 leading-tight drop-shadow-sm">
                {defaultPromoBanner.title}
              </h3>
              <p className="text-sky-300 font-bold text-sm sm:text-base mb-3">
                {defaultPromoBanner.subtitle}
              </p>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                {defaultPromoBanner.description}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(defaultPromoBanner.linkUrl || '/products');
                }}
                className="bg-white text-slate-900 font-black text-xs uppercase px-6 py-3.5 rounded-xl shadow-lg hover:bg-primary hover:text-white transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                <span>{defaultPromoBanner.btnText}</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          {/* Right: Related / Highlighted Products */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
                  Featured &amp; Trending Products
                </h3>
                <p className="text-xs sm:text-sm text-text-muted">
                  Specially selected top products that match current promotional highlights.
                </p>
              </div>
              <Link 
                to="/products" 
                className="text-xs sm:text-sm font-bold text-primary hover:underline whitespace-nowrap flex items-center gap-1 group"
              >
                <span>EXPLORE ALL</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* Products Grid (2 items for 50-50 split) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
              {promoProducts.length > 0 ? (
                promoProducts.slice(0, 2).map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))
              ) : (
                [1, 2].map((n) => (
                  <div key={n} className="h-72 bg-slate-100 rounded-3xl animate-pulse" />
                ))
              )}
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 4. SHOP BY BRAND (Rotating Timer Carousel)                     */}
      {/* ============================================================== */}
      <section 
        className="mb-14"
        onMouseEnter={() => setIsBrandHovered(true)}
        onMouseLeave={() => setIsBrandHovered(false)}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
              <h2 className="text-2xl font-black text-text-main tracking-tight">Shop by Brand</h2>
            </div>
            <p className="text-sm text-text-muted">
              Explore your favorite brands in their dedicated storefronts
            </p>
          </div>

          {/* Controls */}
          {totalBrandPages > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setCurrentBrandPage((prev) => (prev === 0 ? totalBrandPages - 1 : prev - 1))}
                className="w-8 h-8 rounded-lg bg-white shadow-xs hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                aria-label="Previous Brands"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs font-bold text-slate-500 px-2">
                {String(currentBrandPage + 1).padStart(2, '0')} / {String(totalBrandPages).padStart(2, '0')}
              </span>
              <button
                onClick={() => setCurrentBrandPage((prev) => (prev + 1) % totalBrandPages)}
                className="w-8 h-8 rounded-lg bg-white shadow-xs hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                aria-label="Next Brands"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Brands Grid (6 brands per view) */}
        <div className="transition-all duration-500 ease-in-out">
          {brands.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {visibleBrands.map((b) => (
                <BrandCard
                  key={b.brandId}
                  brand={b}
                  onClick={() => navigate(`/brands/${b.brandId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* Brand Page Indicator Dots */}
        {totalBrandPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-5">
            {Array.from({ length: totalBrandPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBrandPage(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentBrandPage ? 'w-6 bg-accent' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Brand page ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>


      {/* ============================================================== */}
      {/* 5. "HELLO MY FRIEND! HAVE A NICE DAY" 3-SLIDE HERO BANNER       */}
      {/* ============================================================== */}
      <section className="relative rounded-2xl overflow-hidden h-80 mb-14 bg-[#172554] shadow-xl group">
        {/* Slide Contents */}
        <div className="relative w-full h-full flex">
          {originalHeroSlides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 flex items-center px-8 sm:px-12 transition-all duration-700 ease-out z-10 ${
                index === currentOldSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
              }`}
            >
              <div className="text-white max-w-md lg:max-w-lg z-10">
                <div className="text-sky-200 font-bold tracking-wider text-xs mb-3 uppercase">
                  {slide.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 drop-shadow-sm">
                  {slide.title}
                </h2>
                <p className="text-white/90 mb-6 text-sm sm:text-base font-normal max-w-md">
                  {slide.description}
                </p>
                <button 
                  onClick={slide.action} 
                  className="bg-[#E11D48] text-white px-7 py-3 text-xs font-bold rounded-lg uppercase tracking-wider shadow hover:bg-sky-500 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  {slide.btnText}
                </button>
              </div>
            </div>
          ))}

          {/* Right Geometric Pattern */}
          <div className="absolute right-4 lg:right-12 inset-y-0 w-1/2 hidden md:flex items-center justify-center z-10">
            <GeometricPatternBanner className="w-full max-w-[380px] h-[220px]" />
          </div>  
        </div> 
        
        {/* Slider Controls (Arrows) */}
        <button 
          onClick={() => setCurrentOldSlide((prev) => (prev === 0 ? originalHeroSlides.length - 1 : prev - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/25 rounded flex items-center justify-center text-white backdrop-blur-xs transition-colors z-20 cursor-pointer"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={() => setCurrentOldSlide((prev) => (prev + 1) % originalHeroSlides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/25 rounded flex items-center justify-center text-white backdrop-blur-xs transition-colors z-20 cursor-pointer"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slider Dots */}
        <div className="absolute bottom-4 left-12 md:left-1/2 -translate-x-0 md:-translate-x-1/2 flex gap-1.5 z-20">
          {originalHeroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentOldSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentOldSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter (01 / 03) */}
        <div className="absolute bottom-4 right-8 text-[11px] font-bold text-white/60 tracking-widest z-20 hidden sm:block">
          {String(currentOldSlide + 1).padStart(2, '0')} / {String(originalHeroSlides.length).padStart(2, '0')}
        </div>
      </section>


      {/* ============================================================== */}
      {/* 6. BEST SELLERS                                                */}
      {/* ============================================================== */}
      <section className="mb-14">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <h2 className="text-2xl font-black text-text-main tracking-tight">Best Seller</h2>
            </div>
            <p className="text-sm text-text-muted">
              Top-selling customer favorites and most purchased items.
            </p>
          </div>
          <button
            onClick={() => routeProducts({ sort: 'salesCount,desc' })}
            className="text-xs sm:text-sm text-primary font-bold hover:underline cursor-pointer"
          >
            VIEW ALL &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.length > 0 ? (
            bestSellers.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))
          ) : (
            [1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
            ))
          )}
        </div>
      </section>


      {/* ============================================================== */}
      {/* 7. POPULAR SEARCHES                                            */}
      {/* ============================================================== */}
      <PopularSearchesHomeSection />


      {/* ============================================================== */}
      {/* 8. WELCOME NOTIFICATION POPUP (Smooth Fade In & Out)          */}
      {/* ============================================================== */}
      {isMounted && (
        <div 
          className={`fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 transform transition-all duration-1000 ease-in-out ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          {/* Close (X) Button */}
          <button 
            onClick={handleCloseWelcome}
            className="absolute top-3 right-3 text-[#EF4444] hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="flex gap-4 items-start pr-6">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0 text-2xl shadow-inner border border-blue-100">
              👋
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base mb-1.5">Welcome!</h3>
              <p className="text-[13px] text-slate-700 leading-relaxed font-bold">
                Welcome to 6SYNC Store. Feel free to browse and find the products you need. Thank you for visiting!
              </p>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};