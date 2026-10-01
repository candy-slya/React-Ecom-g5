 import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productApi } from '../../product/api/productApi';
import type { BrandResponse } from '../../product/api/productApi';

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

        <div className="bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white p-8 rounded shadow-sm mb-8">
  <div className="text-accent font-bold text-[13px] tracking-wider">OUR BRANDS</div>
  <h1 className="text-[34px] font-bold my-1.5">Shop by Brand</h1>
  <p className="text-zinc-200 text-[13px] m-0">Explore products from our available brands.</p>
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
              <div 
                key={b.brandId} 
                onClick={() => navigate(`/brands/${b.brandId}`)} 
                className="bg-white border border-border-subtle p-5 text-center cursor-pointer hover:-translate-y-[3px] hover:border-primary hover:shadow-[0_8px_20px_#0000000d] transition-all"
              >
                <div className="w-[76px] h-[76px] mx-auto border border-border-subtle bg-white rounded-full flex items-center justify-center font-black text-xs mb-3 overflow-hidden">
                  {b.brandLogoUrl ? (
                    <img src={b.brandLogoUrl} className="w-full h-full object-contain" alt={b.brandName} />
                  ) : (
                    b.brandName
                  )}
                </div>
                <b className="text-sm block">{b.brandName}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
