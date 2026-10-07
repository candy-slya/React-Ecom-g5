import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productApi } from '../../product/api/productApi';
import type { BrandResponse } from '../../product/api/productApi';
import { getAssetUrl } from '../../../utils/assetUtils';
import { GeometricPatternBanner } from '../../../components/common/GeometricPatternBanner';

const BrandGridItem: React.FC<{ brand: BrandResponse; onClick: () => void }> = ({ brand, onClick }) => {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getAssetUrl(brand.brandLogoUrl);
  const showImage = Boolean(logoUrl) && !hasError;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-border-subtle p-5 text-center cursor-pointer hover:-translate-y-[3px] hover:border-primary hover:shadow-[0_8px_20px_#0000000d] transition-all"
    >
      <div className="w-[76px] h-[76px] mx-auto border border-border-subtle bg-accent-soft rounded-full flex items-center justify-center font-black text-xs mb-3 overflow-hidden p-2">
        {showImage ? (
          <img
            src={logoUrl}
            className="w-full h-full object-contain"
            alt={brand.brandName}
            onError={() => setHasError(true)}
          />
        ) : (
          <span className="text-xs font-black text-text-main uppercase tracking-wider text-center line-clamp-2 px-1">
            {brand.brandName}
          </span>
        )}
      </div>
      <b className="text-sm block text-text-main">{brand.brandName}</b>
    </div>
  );
};

export const BrandListPage: React.FC = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getActiveBrands().then(res => {
      setBrands(res);
      setLoading(false);
    }).catch((e: any) => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-page pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="py-6 text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link> / Brands
        </div>

        <div className="relative overflow-hidden bg-gradient-to-r from-[#0A39A6] via-[#0C42B5] to-[#0284C7] text-white p-6 sm:p-8 rounded-xl shadow-sm mb-8 flex items-center justify-between">
          <div className="relative z-10 max-w-xl">
            <div className="text-sky-200 font-bold text-[13px] tracking-wider uppercase">OUR BRANDS</div>
            <h1 className="text-3xl sm:text-[34px] font-bold my-1.5 drop-shadow-sm">Shop by Brand</h1>
            <p className="text-zinc-200 text-[13px] m-0">Explore products from our available brands.</p>
          </div>
          <div className="hidden sm:flex relative z-10 flex-shrink-0 items-center justify-end w-[260px] md:w-[320px] lg:w-[360px] h-[130px] md:h-[150px]">
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map(b => (
              <BrandGridItem
                key={b.brandId}
                brand={b}
                onClick={() => navigate(`/brands/${b.brandId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
