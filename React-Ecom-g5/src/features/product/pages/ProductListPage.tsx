import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { ProductCard } from '../../../components/product/ProductCard';
import type { BrandResponse } from '../api/productApi';
import type { CategoryNodeResponse, ProductListResponse, PageResponse } from '../types';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Query Parameters
  const activeSearch = searchParams.get('search') || '';
  const activeCategoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const activeBrandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : undefined;
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeSort = searchParams.get('sort') || 'newest';
  const activePage = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  const [categories, setCategories] = useState<CategoryNodeResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [productsPage, setProductsPage] = useState<PageResponse<ProductListResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Range Input အတွက် Local State
  const [minPrice, setMinPrice] = useState(activeMinPrice ? Number(activeMinPrice) : 0);
  const [maxPrice, setMaxPrice] = useState(activeMaxPrice ? Number(activeMaxPrice) : 10000000); 

  useEffect(() => {
    productApi.getCategoryTree().then(setCategories).catch(console.error);
    productApi.getActiveBrands().then(setBrands).catch(console.error);
  }, []);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const term = categorySearch.toLowerCase().trim();
    
    const filterTree = (nodes: CategoryNodeResponse[]): CategoryNodeResponse[] => {
      return nodes.reduce((acc, node) => {
        if (node.categoryName.toLowerCase().includes(term)) {
          acc.push(node);
          return acc;
        }
        if (node.children && node.children.length > 0) {
          const filteredChildren = filterTree(node.children);
          if (filteredChildren.length > 0) {
            acc.push({ ...node, children: filteredChildren });
          }
        }
        return acc;
      }, [] as CategoryNodeResponse[]);
    };
    return filterTree(categories);
  }, [categories, categorySearch]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const term = brandSearch.toLowerCase().trim();
    return brands.filter(b => b.brandName.toLowerCase().includes(term));
  }, [brands, brandSearch]);

  useEffect(() => {
    setLoading(true);
    productApi.getProducts({
      categoryId: activeCategoryId,
      brandId: activeBrandId,
      search: activeSearch,
      minPrice: activeMinPrice ? Number(activeMinPrice) : undefined,
      maxPrice: activeMaxPrice ? Number(activeMaxPrice) : undefined,
      sort: activeSort,
      page: activePage,
      size: 16 // စာမျက်နှာတစ်ခုတွင် ၁၆ ခုသာ ပြရန်
    }).then(res => {
      setProductsPage(res);
      setLoading(false);
    }).catch((e: any) => {
      console.error(e);
      setLoading(false);
    });
  }, [activeSearch, activeCategoryId, activeBrandId, activeMinPrice, activeMaxPrice, activeSort, activePage]);

  const updateFilters = (newParams: Record<string, any>) => {
    const nextParams = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(newParams)) {
      if (v === null || v === undefined || v === '' || v === 'all' || (Array.isArray(v) && v.length === 0)) {
        nextParams.delete(k);
      } else {
        nextParams.set(k, Array.isArray(v) ? v.join(',') : v.toString());
      }
    }
    // Filter ပြောင်းလျှင် Page 0 သို့ ပြန်သွားမည်
    if (!newParams.hasOwnProperty('page')) {
        nextParams.set('page', '0');
    }
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyPrice = () => {
    updateFilters({ minPrice, maxPrice });
  };

  const clearFilters = () => {
    setMinPrice(0);
    setMaxPrice(10000000);
    setSearchParams(new URLSearchParams());
  };

  const renderCategoryTree = (nodes: CategoryNodeResponse[], depth = 0) => {
    return nodes.map(c => (
      <React.Fragment key={c.categoryId}>
        <label className="block text-[12px] my-2.5 cursor-pointer" style={{ paddingLeft: `${depth * 12}px` }}>
          <input type="radio" name="cat" checked={activeCategoryId === c.categoryId} onChange={() => updateFilters({ categoryId: c.categoryId })} className="mr-2" />
          {depth > 0 && <span className="mr-1 text-gray-400">└</span>}
          {c.categoryName}
        </label>
        {c.children && c.children.length > 0 && renderCategoryTree(c.children, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="min-h-screen bg-page pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="py-6 text-sm text-gray-500">
          <Link to="/" className="hover:underline">Home</Link> / Products
        </div>
        
        <div className="bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white p-8 rounded shadow-sm mb-8 flex items-center justify-between">
          <div>
            <div className="text-accent font-bold text-[13px] tracking-wider">6SYNC CATALOG</div>
            {/* ဤနေရာတွင် Title ကို All Products ဟု အသေထားလိုက်ပါသည် */}
            <h1 className="text-[34px] font-bold my-1.5">
              All Products
            </h1>
            <p className="text-zinc-200 text-[13px] m-0">Refine by category, brand, and price.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-[255px] flex-shrink-0 bg-white border border-border-subtle p-[19px] h-max">
            <h3 className="uppercase text-[14px] font-bold m-0 mb-4">Filter Products</h3>
            
            <div className="border-t border-border-subtle py-[15px]">
              <b className="text-[12px] block mb-2.5">Categories</b>
              <input type="text" placeholder="Search categories..." value={categorySearch} onChange={e => setCategorySearch(e.target.value)} className="w-full mb-3 p-2 border border-border-subtle text-[12px] rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" aria-label="Search categories" />
              <div className="max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                <label className="block text-[12px] my-2.5 cursor-pointer">
                  <input type="radio" name="cat" checked={!activeCategoryId} onChange={() => updateFilters({ categoryId: null })} className="mr-2" />
                  All Categories
                </label>
                {filteredCategories.length > 0 ? renderCategoryTree(filteredCategories) : <div className="text-[12px] text-gray-500 my-2">No categories found</div>}
              </div>
            </div>

            <div className="border-t border-border-subtle py-[15px]">
              <b className="text-[12px] block mb-2.5">Brands</b>
              <input type="text" placeholder="Search brands..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)} className="w-full mb-3 p-2 border border-border-subtle text-[12px] rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" aria-label="Search brands" />
              <div className="max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                <label className="block text-[12px] my-2.5 cursor-pointer">
                  <input type="radio" name="brand" checked={!activeBrandId} onChange={() => updateFilters({ brandId: null })} className="mr-2" />
                  All Brands
                </label>
                {filteredBrands.length > 0 ? filteredBrands.map(b => (
                  <label key={b.brandId} className="block text-[12px] my-2.5 cursor-pointer truncate">
                    <input type="radio" name="brand" checked={activeBrandId === b.brandId} onChange={() => updateFilters({ brandId: b.brandId })} className="mr-2" />
                    {b.brandName}
                  </label>
                )) : <div className="text-[12px] text-gray-500 my-2">No brands found</div>}
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-border-subtle py-[15px]">
              <b className="text-[14px] block mb-4 text-gray-700">Price, K</b>
              
              {/* Box ဖြင့်ပြသခြင်း (လက်ဖြင့် ရိုက်ထည့်၍ မရပါ) */}
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="w-[80px] p-2 border border-primary text-[13px] text-gray-700 rounded-sm text-center bg-white flex-shrink-0">
                  {minPrice === 0 ? "Min" : minPrice}
                </div>
                <span className="text-gray-400">-</span>
                <div className="w-[80px] p-2 border border-gray-300 text-[13px] text-gray-700 rounded-sm text-center bg-white flex-shrink-0">
                  {maxPrice}
                </div>
              </div>

              {/* Range Slider */}
              <div className="relative w-full px-2 mb-8">
                <input 
                  type="range" 
                  min="0" 
                  max="10000000" 
                  step="50000" 
                  value={maxPrice} 
                  onChange={e => {
                    const val = Number(e.target.value);
                    setMaxPrice(val);
                  }} 
                  className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer"
                  style={{ WebkitAppearance: 'none' }}
                />
                
                {/* Inline Styles for Custom Thumb */}
                <style dangerouslySetInnerHTML={{__html: `
                  input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 18px;
                    width: 6px;
                    border-radius: 1px;
                    background: black;
                    cursor: pointer;
                  }
                  input[type=range]::-moz-range-thumb {
                    height: 18px;
                    width: 6px;
                    border-radius: 1px;
                    background: black;
                    cursor: pointer;
                    border: none;
                  }
                `}} />

                {/* Slider Markers/Labels */}
                <div className="absolute top-4 left-0 w-full flex justify-between text-[11px] text-gray-500 px-1">
                  <div className="flex flex-col items-center">
                    <span className="h-1.5 w-[1px] bg-black mb-1"></span>
                    K1K
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="h-1.5 w-[1px] bg-black mb-1"></span>
                    K2.5M
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="h-1.5 w-[1px] bg-black mb-1"></span>
                    K5M
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="h-1.5 w-[1px] bg-black mb-1"></span>
                    K7.5M
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="h-1.5 w-[1px] bg-black mb-1"></span>
                    K10M
                  </div>
                </div>
              </div>

              <button onClick={applyPrice} className="w-full mt-4 bg-[#FF2B6D] text-white font-[800] py-[10px] text-[12px] hover:bg-rose-600 transition-colors rounded-sm shadow-xs">APPLY PRICE</button>
            </div>

            <button onClick={clearFilters} className="w-full bg-white border border-border-subtle font-[800] py-3 px-[18px] mt-[7px] text-[13px] hover:bg-page transition-colors">CLEAR FILTERS</button>
          </aside>

          {/* Main List */}
          <div className="flex-1">
            <div className="flex justify-end items-center mb-4 gap-[18px]">
              <select value={activeSort} onChange={e => updateFilters({ sort: e.target.value })} className="p-2 border text-sm bg-white rounded-md shadow-sm outline-none focus:ring-1 focus:ring-primary">
                <option value="newest">Newest</option>
                <option value="priceAsc">Price Low &rarr; High</option>
                <option value="priceDesc">Price High &rarr; Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {!loading && productsPage?.content.length === 0 ? (
              <div className="bg-white border border-border-subtle p-12 text-center text-gray-500 rounded-lg">
                No products match these filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
                {productsPage?.content.map(p => (
                  <ProductCard key={p.productId} product={p} />
                ))}
              </div>
            )}
            
            {/* Pagination - 16 Products per page */}
            {productsPage && productsPage.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button disabled={productsPage.first} onClick={() => updateFilters({ page: activePage - 1 })} className="px-3 py-1 border border-border-subtle bg-white disabled:opacity-50 hover:bg-gray-50 rounded shadow-sm">&larr;</button>
                <span className="px-4 py-1 text-sm flex items-center font-medium">{activePage + 1} of {productsPage.totalPages}</span>
                <button disabled={productsPage.last} onClick={() => updateFilters({ page: activePage + 1 })} className="px-3 py-1 border border-border-subtle bg-white disabled:opacity-50 hover:bg-gray-50 rounded shadow-sm">&rarr;</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};