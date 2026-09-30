import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { ProductCard } from '../../../components/product/ProductCard';
import type { BrandResponse } from '../api/productApi';
import type { CategoryNodeResponse, ProductListResponse, PageResponse } from '../types';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSearch = searchParams.get('search') || '';
  const activeCategoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const activeBrandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : undefined;
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeAvailability = searchParams.get('availability') || 'all';
  const activeTags = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : [];
  const activeSort = searchParams.get('sort') || 'newest';
  const activePage = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  const [categories, setCategories] = useState<CategoryNodeResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [productsPage, setProductsPage] = useState<PageResponse<ProductListResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Available tags to pick from
  
  // local filter states for sidebar
  const [minPrice, setMinPrice] = useState(activeMinPrice);
  const [maxPrice, setMaxPrice] = useState(activeMaxPrice);

  useEffect(() => {
    productApi.getCategoryTree().then(setCategories).catch(console.error);
    productApi.getActiveBrands().then(setBrands).catch(console.error);
    productApi.getAllTags().then(setAvailableTags).catch(console.error);
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

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return availableTags;
    const term = tagSearch.toLowerCase().trim();
    return availableTags.filter(t => t.toLowerCase().includes(term));
  }, [availableTags, tagSearch]);

  useEffect(() => {
    setLoading(true);
    productApi.getProducts({
      categoryId: activeCategoryId,
      brandId: activeBrandId,
      search: activeSearch,
      minPrice: activeMinPrice ? Number(activeMinPrice) : undefined,
      maxPrice: activeMaxPrice ? Number(activeMaxPrice) : undefined,
      availability: activeAvailability,
      tags: activeTags,
      sort: activeSort,
      page: activePage,
      size: 16
    }).then(res => {
      setProductsPage(res);
      setLoading(false);
    }).catch((e: any) => {
      console.error(e);
      setLoading(false);
    });
  }, [activeSearch, activeCategoryId, activeBrandId, activeMinPrice, activeMaxPrice, activeAvailability, activeTags.join(','), activeSort, activePage]);

  const updateFilters = (newParams: Record<string, any>) => {
    const nextParams = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(newParams)) {
      if (v === null || v === undefined || v === '' || v === 'all' || (Array.isArray(v) && v.length === 0)) {
        nextParams.delete(k);
      } else {
        nextParams.set(k, Array.isArray(v) ? v.join(',') : v.toString());
      }
    }
    nextParams.set('page', '0');
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const toggleTag = (tag: string) => {
    const newTags = activeTags.includes(tag) ? activeTags.filter(t => t !== tag) : [...activeTags, tag];
    updateFilters({ tags: newTags });
  };

  const applyPrice = () => {
    updateFilters({ minPrice, maxPrice });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
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
        
        <div className="bg-gradient-to-r from-secondary to-primary text-white p-8 rounded shadow-sm mb-8">
          <div className="text-[#FFFF00] font-bold text-[13px] tracking-wider">6SYNC CATALOG</div>
          <h1 className="text-[34px] font-bold my-1.5">
            {activeSearch ? `Search Results for "${activeSearch}"` : activeCategoryId ? 'Category' : activeBrandId ? 'Brand' : 'All Products'}
          </h1>
          <p className="text-zinc-200 text-[13px] m-0">Refine by category, brand, price, availability, and tags.</p>
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

            <div className="border-t border-border-subtle py-[15px]">
              <b className="text-[12px] block mb-2.5">Price</b>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-1/2 p-2 border border-border-subtle text-[12px]" />
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-1/2 p-2 border border-border-subtle text-[12px]" />
              </div>
              <button onClick={applyPrice} className="w-full mt-2 bg-[#FFFF00] text-[#000000] font-[800] py-[10px] text-[12px] hover:bg-[#F0EE00] transition-colors rounded-sm">APPLY PRICE</button>
            </div>

            <div className="border-t border-border-subtle py-[15px]">
              <b className="text-[12px] block mb-2.5">Availability</b>
              <select value={activeAvailability} onChange={e => updateFilters({ availability: e.target.value })} className="w-full p-2 border border-border-subtle text-[12px] bg-white rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" aria-label="Availability">
                <option value="all">All</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="SOLD_OUT">Sold Out</option>
              </select>
            </div>

            <div className="border-t border-border-subtle py-[15px]">
              <b className="text-[12px] block mb-2.5">Tags</b>
              <input type="text" placeholder="Search tags..." value={tagSearch} onChange={e => setTagSearch(e.target.value)} className="w-full mb-3 p-2 border border-border-subtle text-[12px] rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" aria-label="Search tags" />
              <div className="max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                {filteredTags.length > 0 ? filteredTags.map(t => (
                  <label key={t} className="block text-[12px] my-2.5 cursor-pointer uppercase truncate">
                    <input type="checkbox" checked={activeTags.includes(t)} onChange={() => toggleTag(t)} className="mr-2" />
                    {t}
                  </label>
                )) : <div className="text-[12px] text-gray-500 my-2">No tags found</div>}
              </div>
            </div>

            <button onClick={clearFilters} className="w-full bg-white border border-border-subtle font-[800] py-3 px-[18px] mt-[7px] text-[13px] hover:bg-page transition-colors">CLEAR FILTERS</button>
          </aside>

          {/* Main List */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-[18px]">
              <div className="text-xs text-gray-500">
                {loading ? 'Loading...' : `Showing ${productsPage?.totalElements || 0} results`}
              </div>
              <select value={activeSort} onChange={e => updateFilters({ sort: e.target.value })} className="p-2 border text-sm bg-white">
                <option value="newest">Newest</option>
                <option value="priceAsc">Price Low &rarr; High</option>
                <option value="priceDesc">Price High &rarr; Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {!loading && productsPage?.content.length === 0 ? (
              <div className="bg-white border p-12 text-center text-gray-500 rounded">
                No products match these filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
                {productsPage?.content.map(p => (
                  <ProductCard key={p.productId} product={p} />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {productsPage && productsPage.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button disabled={productsPage.first} onClick={() => updateFilters({ page: activePage - 1 })} className="px-3 py-1 border bg-white disabled:opacity-50">&larr;</button>
                <span className="px-3 py-1 text-sm">{activePage + 1} of {productsPage.totalPages}</span>
                <button disabled={productsPage.last} onClick={() => updateFilters({ page: activePage + 1 })} className="px-3 py-1 border bg-white disabled:opacity-50">&rarr;</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

