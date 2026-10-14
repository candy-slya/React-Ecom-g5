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
      className="bg-white border border-border-subtle rounded-xl p-4 sm:p-5 text-center cursor-pointer hover:-translate-y-1 hover:border-primary hover:shadow-md transition-all flex flex-col items-center justify-between"
    >
      <div className={`w-24 h-24 sm:w-28 sm:h-28 mx-auto border-2 border-border-subtle bg-white rounded-full flex items-center justify-center font-black text-xs mb-3 overflow-hidden shadow-xs ${isWide ? 'p-2.5' : 'p-0'}`}>
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
      <b className="text-sm sm:text-base block text-text-main font-bold mt-1">{brand.brandName}</b>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryNodeResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductListResponse[]>([]);
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Welcome Popup States (For smooth Fade-in and Fade-out)
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    productApi.getCategoryTree().then(setCategories).catch(console.error);
    productApi.getActiveBrands().then(res => {
      const sorted = [...res].sort((a, b) =>
        (a.brandName || '').localeCompare(b.brandName || '', undefined, { sensitivity: 'base' })
      );
      setBrands(sorted);
    }).catch(console.error);
    productApi.getBestSellers().then(res => setBestSellers(res.content)).catch(console.error);
  }, []);

  // Auto-play Slider (5 စက္ကန့် တစ်ခါပြောင်းရန်)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
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
      // 1.5s နေမှ Popup ကို စတင် Mount လုပ်မည်
      mountTimer = setTimeout(() => {
        setIsMounted(true);
        
        // DOM မှာ Mount ဖြစ်ပြီးတာနဲ့ Opacity စတင်ပြောင်းလဲရန် (Fade-in)
        visibleTimer = setTimeout(() => {
          setIsVisible(true);
        }, 50);
        
        // ၅ စက္ကန့်ပြည့်လျှင် ပြန်ဖျောက်ရန် (Fade-out)
        hideTimer = setTimeout(() => {
          setIsVisible(false);
          
          // Fade-out animation ပြီးဆုံးရန် ၁ စက္ကန့် ထပ်စောင့်ပြီးမှ DOM ထဲက ဖယ်ထုတ်မည်
          unmountTimer = setTimeout(() => {
            setIsMounted(false);
            sessionStorage.setItem('hasSeenWelcome', 'true');
          }, 1000); 
        }, 5050); // 5 seconds duration
      }, 1500);
    }

    return () => {
      if (mountTimer) clearTimeout(mountTimer);
      if (visibleTimer) clearTimeout(visibleTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (unmountTimer) clearTimeout(unmountTimer);
    };
  }, []);

  // X ခလုတ်နှိပ်၍ ပိတ်လျှင်လည်း ဖြေးဖြေးချင်း ပျောက်သွားစေရန်
  const handleCloseWelcome = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsMounted(false);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }, 1000); // Wait for transition to finish
  };

  const routeProducts = (params?: Record<string, any>) => {
    const q = new URLSearchParams(params).toString();
    navigate(`/products${q ? '?' + q : ''}`);
  };

  const heroSlides = [
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

  const nextSlide = () => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* Hero Section (Slider) */}
      <div className="relative rounded-xl overflow-hidden h-80 mb-10 bg-[#172554] shadow-md group">
        
        {/* Slide Contents */}
        <div className="relative w-full h-full flex">
          {heroSlides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 flex items-center px-8 sm:px-12 transition-all duration-700 ease-out z-10 ${
                index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
              }`}
            >
              <div className="text-white max-w-md lg:max-w-lg z-10">
                <div className="text-sky-200 font-bold tracking-wider text-xs mb-3 uppercase">
                  {slide.badge}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 drop-shadow-sm">
                  {slide.title}
                </h1>
                <p className="text-white/90 mb-6 text-sm sm:text-base font-normal max-w-md">
                  {slide.description}
                </p>
                <button 
                  onClick={slide.action} 
                  className="bg-[#E11D48] text-white px-7 py-3 text-xs font-bold rounded uppercase tracking-wider shadow hover:bg-sky-500 transition-all transform hover:-translate-y-0.5"
                >
                  {slide.btnText}
                </button>
              </div>
            </div>
          ))}

          {/* Right Geometric Pattern - Prominent & Seamlessly Integrated */}
          <div className="absolute right-4 lg:right-12 inset-y-0 w-1/2 hidden md:flex items-center justify-center z-10">
            <GeometricPatternBanner className="w-full max-w-[380px] h-[220px]" />
          </div>  
        </div> 
        
        {/* Slider Controls (Arrows) */}
        <button 
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/25 rounded flex items-center justify-center text-white backdrop-blur-xs transition-colors z-20"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 hover:bg-white/25 rounded flex items-center justify-center text-white backdrop-blur-xs transition-colors z-20"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"></path></svg>
        </button>

        {/* Slider Dots */}
        <div className="absolute bottom-4 left-12 md:left-1/2 -translate-x-0 md:-translate-x-1/2 flex gap-1.5 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter (03 / 03) */}
        <div className="absolute bottom-4 right-8 text-[11px] font-bold text-white/60 tracking-widest z-20 hidden sm:block">
          {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
        </div>
      </div>

      {/* Categories */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold">Browse Categories</h2>
            <div className="text-sm text-gray-500">Choose a department and open its dedicated product page.</div>
          </div>
          <Link to="/categories" className="text-sm text-primary font-bold hover:underline">VIEW ALL CATEGORIES &rarr;</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map(c => (
            <CategoryCard
              key={c.categoryId}
              category={c}
              onClick={() => navigate(`/categories/${c.categoryId}`)}
            />
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Shop by Brand</h2>
          <div className="text-sm text-gray-500">Explore a brand in its own storefront page.</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map(b => (
            <BrandCard
              key={b.brandId}
              brand={b}
              onClick={() => navigate(`/brands/${b.brandId}`)}
            />
          ))}
        </div>
      </section>

      <PopularSearchesHomeSection />

      {/* Best Sellers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-1">
          Best Seller
        </h2>
        <div className="text-sm text-gray-500 mb-4">
          Top-selling products.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((p) => (
            <ProductCard
              key={p.productId}
              product={p}
            />
          ))}
        </div>
      </section>

      {/* Welcome Notification Popup (Smooth Fade In & Out) */}
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
            {/* Waving Hand Icon */}
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