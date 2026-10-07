import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import type { BrandResponse } from '../api/productApi';
import type {
  CategoryNodeResponse,
  PageResponse,
  ProductListResponse
} from '../types';
import { ProductCard } from '../../../components/product/ProductCard';
import { GeometricPatternBanner } from '../../../components/common/GeometricPatternBanner';

const MAX_PRICE = 5_000_000;

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ================= URL FILTERS ================= */

  const activeSearch = searchParams.get('search') || '';
  const activeCategoryId = searchParams.get('categoryId')
    ? Number(searchParams.get('categoryId'))
    : undefined;
  const activeBrandId = searchParams.get('brandId')
    ? Number(searchParams.get('brandId'))
    : undefined;
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeSort = searchParams.get('sort') || 'newest';
  const activePage = searchParams.get('page')
    ? Number(searchParams.get('page'))
    : 0;

  const activeTags = useMemo(
    () =>
      (searchParams.get('tags') || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    [searchParams]
  );

  /* ================= STATE ================= */

  const [categories, setCategories] = useState<CategoryNodeResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [productsPage, setProductsPage] =
    useState<PageResponse<ProductListResponse> | null>(null);

  const [loading, setLoading] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const [minPrice, setMinPrice] = useState(
    activeMinPrice ? Number(activeMinPrice) : 0
  );

  const [maxPrice, setMaxPrice] = useState(
    activeMaxPrice ? Number(activeMaxPrice) : MAX_PRICE
  );

  /* ================= MASTER DATA ================= */

  useEffect(() => {
    productApi.getCategoryTree().then(setCategories).catch(console.error);
    productApi.getActiveBrands().then(setBrands).catch(console.error);
  }, []);

  useEffect(() => {
    setMinPrice(activeMinPrice ? Number(activeMinPrice) : 0);
    setMaxPrice(activeMaxPrice ? Number(activeMaxPrice) : MAX_PRICE);
  }, [activeMinPrice, activeMaxPrice]);

  /* ================= CATEGORY SEARCH ================= */

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;

    const term = categorySearch.toLowerCase().trim();

    const filterTree = (
      nodes: CategoryNodeResponse[]
    ): CategoryNodeResponse[] =>
      nodes.reduce((result, node) => {
        const match = node.categoryName.toLowerCase().includes(term);
        const children = node.children?.length
          ? filterTree(node.children)
          : [];

        if (match || children.length) {
          result.push({
            ...node,
            children: match ? node.children : children
          });
        }

        return result;
      }, [] as CategoryNodeResponse[]);

    return filterTree(categories);
  }, [categories, categorySearch]);

  /* ================= BRAND SEARCH ================= */

  const filteredBrands = useMemo(() => {
    const term = brandSearch.toLowerCase().trim();

    return term
      ? brands.filter(b => b.brandName.toLowerCase().includes(term))
      : brands;
  }, [brands, brandSearch]);

  /* ================= TAGS ================= */

  const availableTags = useMemo(() => {
    const tags = new Set<string>();

    productsPage?.content.forEach(product =>
      product.tags?.forEach(tag => tag && tags.add(tag))
    );

    activeTags.forEach(tag => tags.add(tag));

    return [...tags].sort();
  }, [productsPage, activeTags]);

  const filteredTags = useMemo(() => {
    const term = tagSearch.toLowerCase().trim();

    return term
      ? availableTags.filter(tag => tag.toLowerCase().includes(term))
      : availableTags;
  }, [availableTags, tagSearch]);

  /* ================= LOAD PRODUCTS ================= */

  useEffect(() => {
    setLoading(true);

    productApi
      .getProducts({
        categoryId: activeCategoryId,
        brandId: activeBrandId,
        search: activeSearch,
        tags: activeTags.length ? activeTags : undefined,
        minPrice: activeMinPrice ? Number(activeMinPrice) : undefined,
        maxPrice: activeMaxPrice ? Number(activeMaxPrice) : undefined,
        sort: activeSort,
        page: activePage,
        size: 16
      })
      .then(setProductsPage)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [
    activeSearch,
    activeCategoryId,
    activeBrandId,
    activeTags,
    activeMinPrice,
    activeMaxPrice,
    activeSort,
    activePage
  ]);

  /* ================= UPDATE FILTER ================= */

  const updateFilters = (values: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(values).forEach(([key, value]) => {
      if (
        value == null ||
        value === '' ||
        value === 'all' ||
        (Array.isArray(value) && !value.length)
      ) {
        next.delete(key);
      } else {
        next.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });

    if (!Object.prototype.hasOwnProperty.call(values, 'page')) {
      next.set('page', '0');
    }

    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ================= ACTIONS ================= */

  const handleTagClick = (tag: string) => {
    updateFilters({
      tags: activeTags.includes(tag)
        ? activeTags.filter(t => t !== tag)
        : [...activeTags, tag]
    });
  };

  const applyPrice = () => {
    if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) return;

    updateFilters({
      minPrice: minPrice > 0 ? minPrice : null,
      maxPrice: maxPrice < MAX_PRICE ? maxPrice : null
    });
  };

  const clearPrice = () => {
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    updateFilters({ minPrice: null, maxPrice: null });
  };

  const clearFilters = () => {
    setCategorySearch('');
    setBrandSearch('');
    setTagSearch('');
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setSearchParams(new URLSearchParams());
  };

  /* ================= CATEGORY TREE ================= */

  const renderCategoryTree = (
    nodes: CategoryNodeResponse[],
    depth = 0
  ): React.ReactNode =>
    nodes.map(category => (
      <React.Fragment key={category.categoryId}>
        <label
          className="block text-[12px] my-2.5 cursor-pointer"
          style={{ paddingLeft: `${depth * 12}px` }}
        >
          <input
            type="radio"
            name="cat"
            checked={activeCategoryId === category.categoryId}
            onChange={() =>
              updateFilters({ categoryId: category.categoryId })
            }
            className="mr-2 accent-[#0A39A6]"
          />

          {depth > 0 && (
            <span className="mr-1 text-gray-400">└</span>
          )}

          {category.categoryName}
        </label>

        {!!category.children?.length &&
          renderCategoryTree(category.children, depth + 1)}
      </React.Fragment>
    ));

  /* ================= CHIP NAMES ================= */

  const findCategoryName = (
    nodes: CategoryNodeResponse[],
    id: number
  ): string | undefined => {
    for (const node of nodes) {
      if (node.categoryId === id) return node.categoryName;

      if (node.children?.length) {
        const result = findCategoryName(node.children, id);
        if (result) return result;
      }
    }
  };

  const categoryName = activeCategoryId
    ? findCategoryName(categories, activeCategoryId)
    : '';

  const brandName = activeBrandId
    ? brands.find(b => b.brandId === activeBrandId)?.brandName
    : '';

  const hasFilters =
    !!activeCategoryId ||
    !!activeBrandId ||
    !!activeSearch ||
    !!activeMinPrice ||
    !!activeMaxPrice ||
    activeTags.length > 0;

  const filterCount =
    (activeCategoryId ? 1 : 0) +
    (activeBrandId ? 1 : 0) +
    activeTags.length +
    (activeMinPrice || activeMaxPrice ? 1 : 0);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-page pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="py-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary hover:underline">
            Home
          </Link>
          {' / '}Products
        </div>

      {/* Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0A39A6] via-[#0C42B5] to-[#0284C7] text-white p-6 sm:p-8 rounded-2xl shadow-md mb-8 flex items-center justify-between min-h-[160px]">
          <div className="relative z-10 max-w-xl">
            <div className="text-sky-200 font-bold text-[13px] tracking-wider uppercase mb-1">
              6SYNC CATALOG
            </div>
            <h1 className="text-3xl sm:text-[34px] font-black my-1.5 drop-shadow-sm">
              All Products
            </h1>
            <p className="text-sky-100 text-sm max-w-xl m-0 font-medium">
              Refine by category, brand, tags and price.
            </p>
          </div>
          <div className="hidden sm:flex relative z-10 flex-shrink-0 items-center justify-end w-[260px] md:w-[320px] lg:w-[360px] h-[120px] md:h-[140px]">
            <GeometricPatternBanner className="w-full h-full" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">

          {/* =====================================================
              FILTER SIDEBAR
          ===================================================== */}

          <aside className="w-full md:w-[275px] flex-shrink-0 h-max">
            <div className="bg-white border border-border-subtle overflow-hidden">

              {/* KEEP FILTER HEADER */}
              <div className="bg-gradient-to-r from-[#0A39A6] to-[#0284C7] px-5 py-4 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-[13px] font-black uppercase tracking-wide">
                    FILTER PRODUCTS
                  </h3>
                  <p className="text-[10px] text-sky-100">
                    Refine your results
                  </p>
                </div>

                {filterCount > 0 && (
                  <span className="w-6 h-6 bg-white text-[#0A39A6] rounded-full text-[10px] font-black flex items-center justify-center">
                    {filterCount}
                  </span>
                )}
              </div>

              <div className="p-[18px]">

                {/* CATEGORIES */}
                <FilterSection title="Categories">
                  <input
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="filter-input mb-2"
                  />

                  <div className="max-h-52 overflow-y-auto">
                    <label className="block text-[12px] my-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="cat"
                        checked={!activeCategoryId}
                        onChange={() => updateFilters({ categoryId: null })}
                        className="mr-2 accent-[#0A39A6]"
                      />
                      All Categories
                    </label>

                    {filteredCategories.length
                      ? renderCategoryTree(filteredCategories)
                      : <EmptyText>No categories found</EmptyText>}
                  </div>
                </FilterSection>

                {/* BRANDS */}
                <FilterSection title="Brands">
                  <input
                    value={brandSearch}
                    onChange={e => setBrandSearch(e.target.value)}
                    placeholder="Search brands..."
                    className="filter-input mb-2"
                  />

                  <div className="max-h-52 overflow-y-auto">
                    <label className="block text-[12px] my-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="brand"
                        checked={!activeBrandId}
                        onChange={() => updateFilters({ brandId: null })}
                        className="mr-2 accent-[#0A39A6]"
                      />
                      All Brands
                    </label>

                    {filteredBrands.length ? (
                      filteredBrands.map(brand => (
                        <label
                          key={brand.brandId}
                          className="block text-[12px] my-2.5 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="brand"
                            checked={activeBrandId === brand.brandId}
                            onChange={() =>
                              updateFilters({ brandId: brand.brandId })
                            }
                            className="mr-2 accent-[#0A39A6]"
                          />
                          {brand.brandName}
                        </label>
                      ))
                    ) : (
                      <EmptyText>No brands found</EmptyText>
                    )}
                  </div>
                </FilterSection>

                {/* TAGS
                    Sidebar only:
                    - no #
                    - blue buttons
                */}
                <FilterSection title="Tags">
                  <input
                    value={tagSearch}
                    onChange={e => setTagSearch(e.target.value)}
                    placeholder="Search tags..."
                    className="filter-input mb-3"
                  />

                  {filteredTags.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {filteredTags.map(tag => {
                        const selected = activeTags.includes(tag);

                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className={`px-2.5 py-1.5 border text-[10px] font-bold transition ${
                              selected
                                ? 'bg-[#0A39A6] border-[#0A39A6] text-white'
                                : 'bg-white border-blue-200 text-[#0A39A6] hover:bg-blue-50'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyText>No tags available</EmptyText>
                  )}
                </FilterSection>

                {/* PRICE */}
                <FilterSection title="Price, K">

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-[9px] text-gray-400">
                        Min
                      </label>

                      <input
                        type="number"
                        min={0}
                        max={MAX_PRICE}
                        value={minPrice}
                        onChange={e =>
                          setMinPrice(Math.max(0, Number(e.target.value)))
                        }
                        className="filter-input mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-400">
                        Max
                      </label>

                      <input
                        type="number"
                        min={0}
                        max={MAX_PRICE}
                        value={maxPrice}
                        onChange={e =>
                          setMaxPrice(
                            Math.min(
                              MAX_PRICE,
                              Math.max(0, Number(e.target.value))
                            )
                          )
                        }
                        className="filter-input mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] font-semibold mb-2">
                    <span>K{minPrice.toLocaleString()}</span>
                    <span>K{maxPrice.toLocaleString()}</span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={MAX_PRICE}
                    step={50_000}
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#0A39A6]"
                  />

                  <div className="flex justify-between text-[8px] text-gray-400 mt-1">
                    <span>K0</span>
                    <span>K1M</span>
                    <span>K2M</span>
                    <span>K3M</span>
                    <span>K4M</span>
                    <span>K5M</span>
                  </div>

                  {minPrice > maxPrice && (
                    <p className="text-[10px] text-red-500 mt-2">
                      Min price cannot be greater than Max price.
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={minPrice > maxPrice}
                    onClick={applyPrice}
                    className="w-full mt-4 bg-[#0A39A6] hover:bg-[#082E86] disabled:bg-gray-300 text-white font-black py-2.5 text-[11px] transition"
                  >
                    APPLY PRICE
                  </button>

                  {(activeMinPrice || activeMaxPrice) && (
                    <button
                      type="button"
                      onClick={clearPrice}
                      className="w-full mt-2 text-[10px] text-[#0A39A6] font-bold hover:underline"
                    >
                      Clear Price
                    </button>
                  )}
                </FilterSection>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full border border-gray-200 py-2.5 text-[11px] font-bold hover:bg-gray-50"
                >
                  CLEAR FILTERS
                </button>
              </div>
            </div>
          </aside>

          {/* =====================================================
              PRODUCT AREA
          ===================================================== */}

          <main className="flex-1 min-w-0">

            {/* ===================================================
                KEEP THIS TOP AREA STYLE / UI
            =================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <span className="text-[12px] text-slate-500">
                {!loading && productsPage && (
                  <>
                    Showing{' '}
                    <b className="text-slate-800">
                      {productsPage.content.length}
                    </b>{' '}
                    products
                  </>
                )}
              </span>

              <select
                value={activeSort}
                onChange={e => updateFilters({ sort: e.target.value })}
                className="px-3 py-2 border border-slate-200 text-[12px] bg-white outline-none"
              >
                <option value="newest">Newest</option>
                <option value="priceAsc">Price Low → High</option>
                <option value="priceDesc">Price High → Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* ===================================================
                ACTIVE FILTER CHIPS
                KEEP EXISTING LOOK:
                Category = blue
                Tag = pink/red + #
                Price = orange
                Clear all = gray text
            =================================================== */}

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">

                {categoryName && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ categoryId: null })}
                    className="px-3 py-1.5 rounded-full bg-blue-50 text-[#0A39A6] text-[10px] font-bold"
                  >
                    {categoryName} ×
                  </button>
                )}

                {brandName && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ brandId: null })}
                    className="px-3 py-1.5 rounded-full bg-blue-50 text-[#0A39A6] text-[10px] font-bold"
                  >
                    {brandName} ×
                  </button>
                )}

                {activeTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 rounded-full bg-rose-50 text-[#FF2B6D] text-[10px] font-bold"
                  >
                    #{tag} ×
                  </button>
                ))}

                {(activeMinPrice || activeMaxPrice) && (
                  <button
                    type="button"
                    onClick={clearPrice}
                    className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold"
                  >
                    K{activeMinPrice || 0} - K{activeMaxPrice || MAX_PRICE} ×
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* LOADING */}
            {loading ? (
              <div className="bg-white border border-border-subtle py-16 text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-[#0A39A6] rounded-full animate-spin mx-auto mb-3" />
                <span className="text-[12px] text-gray-500">
                  Loading products...
                </span>
              </div>

            ) : !productsPage?.content.length ? (

              /* EMPTY */
              <div className="bg-white border border-border-subtle p-12 text-center">
                <h3 className="font-bold text-gray-700">
                  No products found
                </h3>

                <p className="text-[12px] text-gray-400 mt-1 mb-4">
                  Try changing or clearing your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 bg-[#0A39A6] text-white text-[11px] font-bold"
                >
                  CLEAR FILTERS
                </button>
              </div>

            ) : (

              /* PRODUCT GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
                {productsPage.content.map(product => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                  />
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {productsPage && productsPage.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">

                <button
                  type="button"
                  disabled={productsPage.first}
                  onClick={() =>
                    updateFilters({ page: activePage - 1 })
                  }
                  className="page-btn"
                >
                  ←
                </button>

                <span className="px-4 h-9 flex items-center bg-white border border-gray-200 text-[12px]">
                  Page{' '}
                  <b className="mx-1 text-[#0A39A6]">
                    {activePage + 1}
                  </b>
                  of {productsPage.totalPages}
                </span>

                <button
                  type="button"
                  disabled={productsPage.last}
                  onClick={() =>
                    updateFilters({ page: activePage + 1 })
                  }
                  className="page-btn"
                >
                  →
                </button>

              </div>
            )}

          </main>
        </div>
      </div>

      {/* Small shared CSS */}
      <style>{`
        .filter-input {
          width: 100%;
          padding: 8px 10px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          font-size: 11px;
          outline: none;
        }

        .filter-input:focus {
          border-color: #0284C7;
        }

        .page-btn {
          width: 36px;
          height: 36px;
          background: white;
          border: 1px solid #E2E8F0;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #0A39A6;
          color: #0A39A6;
        }

        .page-btn:disabled {
          opacity: .4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

/* ================= SMALL UI COMPONENTS ================= */

const FilterSection = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border-t border-border-subtle py-4">
    <b className="block text-[11px] uppercase tracking-wider text-gray-700 mb-2.5">
      {title}
    </b>
    {children}
  </div>
);

const EmptyText = ({
  children
}: {
  children: React.ReactNode;
}) => (
  <div className="text-[11px] text-gray-400 py-2">
    {children}
  </div>
);