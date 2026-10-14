import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productApi } from '../../product/api/productApi';
import type { BrandResponse } from '../../product/api/productApi';
import { getAssetUrl } from '../../../utils/assetUtils';
import { GeometricPatternBanner } from '../../../components/common/GeometricPatternBanner';

const BrandGridItem: React.FC<{ brand: BrandResponse; onClick: () => void }> = ({ brand, onClick }) => {
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
            className={`w-full h-full rounded-full transition-all ${
              isWide ? 'object-contain' : 'object-cover'
            }`}
            alt={brand.brandName}
            onLoad={handleImageLoad}
            onError={() => setHasError(true)}
          />
        ) : (
          <span className="text-xs sm:text-sm font-black text-text-main uppercase tracking-wider text-center line-clamp-2 px-1">
            {brand.brandName}
          </span>
        )}
      </div>
      <b className="text-sm sm:text-base block text-text-main font-bold tracking-tight mt-1">{brand.brandName}</b>
    </div>
  );
};

export const BrandListPage: React.FC = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // တစ်မျက်နှာလျှင် ၉ ခု (၃ ခုတန်း ၃ တန်း)

  useEffect(() => {
    productApi.getActiveBrands().then(res => {
      const sorted = [...res].sort((a, b) =>
        (a.brandName || '').localeCompare(b.brandName || '', undefined, { sensitivity: 'base' })
      );
      setBrands(sorted);
      setLoading(false);
    }).catch((e: any) => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const totalPages = Math.ceil(brands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBrands = brands.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-page pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="py-6 text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link> / Brands
        </div>

        {/* Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0A39A6] via-[#0C42B5] to-[#0284C7] text-white p-6 sm:p-8 rounded-2xl shadow-md mb-8 flex items-center justify-between min-h-[160px]">
          <div className="relative z-10 max-w-xl">
            <div className="text-sky-200 font-bold text-[13px] tracking-wider uppercase mb-1">
              OUR BRANDS
            </div>
            <h1 className="text-3xl sm:text-[34px] font-black my-1.5 drop-shadow-sm">
              Shop by Brand
            </h1>
            <p className="text-sky-100 text-sm max-w-xl m-0 font-medium">
              Explore products from our available brands.
            </p>
          </div>
          <div className="hidden sm:flex relative z-10 flex-shrink-0 items-center justify-end w-[260px] md:w-[320px] lg:w-[360px] h-[120px] md:h-[140px]">
            <GeometricPatternBanner className="w-full h-full" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading brands...</div>
        ) : brands.length === 0 ? (
          <div className="bg-white border p-12 text-center text-gray-500 rounded">
            No brands available.
          </div>
        ) : (
          <>
            {/* ၃ ခုတန်းစီ ပြရန် Grid ကို grid-cols-2 sm:grid-cols-3 သို့ ပြင်ဆင်ထားသည် */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 lg:max-w-4xl lg:mx-auto">
              {currentBrands.map(b => (
                <BrandGridItem
                  key={b.brandId}
                  brand={b}
                  onClick={() => navigate(`/brands/${b.brandId}`)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-border-subtle bg-white text-sm font-semibold text-text-main hover:bg-page hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-white text-text-main border border-border-subtle hover:bg-page hover:text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-border-subtle bg-white text-sm font-semibold text-text-main hover:bg-page hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};