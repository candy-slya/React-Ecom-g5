import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../../product/api/productApi';
import type { BrandResponse } from '../../product/api/productApi';
import { ProductCard } from '../../../components/product/ProductCard';
import type { ProductListResponse, PageResponse } from '../../product/types';
import { getAssetUrl } from '../../../utils/assetUtils';
import { GeometricPatternBanner } from '../../../components/common/GeometricPatternBanner';

export const BrandDetailPage: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [brand, setBrand] = useState<BrandResponse | null>(null);
  const [productsPage, setProductsPage] = useState<PageResponse<ProductListResponse> | null>(null);
  const [loadingBrand, setLoadingBrand] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  const activeSort = searchParams.get('sort') || 'newest';
  const activePage = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  useEffect(() => {
    if (!brandId) return;
    setLoadingBrand(true);
    productApi.getActiveBrands().then(res => {
      const found = res.find(b => b.brandId === Number(brandId));
      setBrand(found || null);
      setLoadingBrand(false);
    }).catch((e: any) => {
      console.error(e);
      setLoadingBrand(false);
    });
  }, [brandId]);

  useEffect(() => {
    if (!brandId) return;
    setLoadingProducts(true);
    
    // Construct params preserving existing pagination and sort for the brand page
    const params: Record<string, any> = { brandId: Number(brandId) };
    if (activeSort) params.sort = activeSort;
    if (activePage !== undefined) params.page = activePage;
    
    productApi.getProducts(params).then(res => {
      setProductsPage(res);
      setLoadingProducts(false);
    }).catch((e: any) => {
      console.error(e);
      setLoadingProducts(false);
    });
  }, [brandId, activeSort, activePage]);

  const updateFilters = (newParams: Record<string, any>) => {
    const nextParams = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(newParams)) {
      if (v === null || v === undefined || v === '') {
        nextParams.delete(k);
      } else {
        nextParams.set(k, v.toString());
      }
    }
    if (!newParams.page) {
      nextParams.set('page', '0');
    }
    setSearchParams(nextParams);
  };

  if (loadingBrand) {
    return <div className="text-center py-20 text-gray-500">Loading brand...</div>;
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-page pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-500">
          <h2 className="text-2xl font-bold mb-4">Brand not found</h2>
          <Link to="/brands" className="text-primary hover:underline">Return to Brands</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="py-6 text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link> / <Link to="/brands" className="hover:underline">Brands</Link> / {brand.brandName}
        </div>

       <div className="relative overflow-hidden bg-gradient-to-r from-[#0A39A6] via-[#0C42B5] to-[#0284C7] text-white p-6 sm:p-8 rounded-xl shadow-sm mb-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-[100px] h-[100px] flex-shrink-0 border border-white/20 rounded-full flex items-center justify-center overflow-hidden bg-white p-2 shadow-xs">
              {brand.brandLogoUrl && !logoError ? (
                <img
                  src={getAssetUrl(brand.brandLogoUrl)}
                  className="w-full h-full object-contain"
                  alt={brand.brandName}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-bold text-gray-500 text-center text-sm px-2">{brand.brandName}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl sm:text-[34px] font-bold m-0 text-white drop-shadow-sm">{brand.brandName}</h1>
              <p className="text-sky-100 mt-2 text-sm font-medium">Products by {brand.brandName}</p>
            </div>
          </div>
          <div className="hidden sm:flex relative z-10 flex-shrink-0 items-center justify-end w-[260px] md:w-[320px] lg:w-[360px] h-[130px] md:h-[150px]">
            <GeometricPatternBanner className="w-full h-full" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-[18px]">
          <div className="text-xs text-gray-500">
            {loadingProducts ? 'Loading products...' : `Showing ${productsPage?.totalElements || 0} products`}
          </div>
          <select value={activeSort} onChange={e => updateFilters({ sort: e.target.value, page: 0 })} className="p-2 border text-sm bg-white">
            <option value="newest">Newest</option>
            <option value="priceAsc">Price Low &rarr; High</option>
            <option value="priceDesc">Price High &rarr; Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {loadingProducts ? (
          <div className="text-center py-12 text-gray-500">Loading products...</div>
        ) : productsPage?.content.length === 0 ? (
          <div className="bg-white border p-12 text-center text-gray-500 rounded">
            No products available for this brand.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
              {productsPage?.content.map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
            
            {/* Pagination */}
            {productsPage && productsPage.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button disabled={productsPage.first} onClick={() => updateFilters({ page: activePage - 1 })} className="px-3 py-1 border bg-white disabled:opacity-50">&larr;</button>
                <span className="px-3 py-1 text-sm">{activePage + 1} of {productsPage.totalPages}</span>
                <button disabled={productsPage.last} onClick={() => updateFilters({ page: activePage + 1 })} className="px-3 py-1 border bg-white disabled:opacity-50">&rarr;</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
