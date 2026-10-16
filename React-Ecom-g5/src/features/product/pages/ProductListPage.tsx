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

const MIN_PRICE = 10_000;
const MAX_PRICE = 10_000_000;
const DEFAULT_MIN_PRICE = 50_000;
const DEFAULT_MAX_PRICE = 500_000;
const PRICE_STEP = 10_000; // slider precision: 30,000, 50,000, etc.
const MIN_HANDLE_GAP = 50_000; // prevent the two handles from overlapping
const DROPDOWN_STEP = 20_000; // shorter dropdown: 20,000, 40,000, 60,000...
const PRICE_OPTIONS = [
  MIN_PRICE,
  ...Array.from(
    { length: MAX_PRICE / DROPDOWN_STEP },
    (_, index) => (index + 1) * DROPDOWN_STEP
  )
];

// Nonlinear slider: customers get more control over everyday budgets.
// Dropdowns still support the entire 10,000–10,000,000 MMK range.
const SLIDER_MAX = 1000;
const priceToSlider = (price: number) =>
  Math.round(Math.cbrt((Math.max(MIN_PRICE, Math.min(MAX_PRICE, price)) - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * SLIDER_MAX);
const sliderToPrice = (position: number) =>
  Math.max(MIN_PRICE, Math.min(MAX_PRICE,
    Math.round((MIN_PRICE + (MAX_PRICE - MIN_PRICE) * Math.pow(position / SLIDER_MAX, 3)) / PRICE_STEP) * PRICE_STEP
  ));

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
  const [catalogTags, setCatalogTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  const [minPrice, setMinPrice] = useState(
    activeMinPrice ? Number(activeMinPrice) : DEFAULT_MIN_PRICE
  );

  const [maxPrice, setMaxPrice] = useState(
    activeMaxPrice ? Number(activeMaxPrice) : DEFAULT_MAX_PRICE
  );

  /* ================= MASTER DATA ================= */

  useEffect(() => {
    productApi.getCategoryTree().then(setCategories).catch(console.error);
    productApi.getActiveBrands().then(setBrands).catch(console.error);
  }, []);

  useEffect(() => {
    setMinPrice(activeMinPrice ? Number(activeMinPrice) : DEFAULT_MIN_PRICE);
    setMaxPrice(activeMaxPrice ? Number(activeMaxPrice) : DEFAULT_MAX_PRICE);
  }, [activeMinPrice, activeMaxPrice]);

  /* ================= TAG OPTIONS ================= */

  // Load tag choices separately so selecting a category, brand or tag
  // does not make the other available tag buttons disappear.
  useEffect(() => {
    let cancelled = false;

    const loadTagOptions = async () => {
      setTagsLoading(true);
      try {
        const found = new Set<string>();
        // Existing product API is reused; no new backend endpoint is assumed.
        // Cap requests to avoid excessive traffic on very large catalogs.
        for (let page = 0; page < 10; page++) {
          const response = await productApi.getProducts({
            page,
            size: 100,
            sort: 'newest'
          });
          response.content.forEach(product =>
            product.tags?.forEach(tag => {
              if (tag?.trim()) found.add(tag.trim());
            })
          );
          if (response.last || page + 1 >= response.totalPages) break;
        }
        if (!cancelled) setCatalogTags([...found].sort());
      } catch (error) {
        console.error('Unable to load catalog tags:', error);
      } finally {
        if (!cancelled) setTagsLoading(false);
      }
    };

    void loadTagOptions();
    return () => { cancelled = true; };
  }, []);

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

    catalogTags.forEach(tag => tags.add(tag));
    // Keep the current product tags as a fallback if catalog loading fails.
    productsPage?.content.forEach(product =>
      product.tags?.forEach(tag => tag && tags.add(tag))
    );

    activeTags.forEach(tag => tags.add(tag));

    return [...tags].sort();
  }, [catalogTags, productsPage, activeTags]);

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
    if (minPrice < MIN_PRICE || maxPrice > MAX_PRICE || minPrice >= maxPrice) return;

    updateFilters({
      minPrice: minPrice > MIN_PRICE ? minPrice : null,
      maxPrice: maxPrice < MAX_PRICE ? maxPrice : null
    });
  };

  const clearPrice = () => {
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
    updateFilters({ minPrice: null, maxPrice: null });
  };

  const clearFilters = () => {
    setCategorySearch('');
    setBrandSearch('');
    setTagSearch('');
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
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

          <aside className="w-full md:w-[300px] lg:w-[305px] flex-shrink-0 h-max">
            <div className="bg-white border border-slate-200 overflow-hidden rounded-2xl shadow-sm">

              {/* KEEP FILTER HEADER */}
              <div className="bg-gradient-to-r from-[#0A39A6] to-[#0284C7] px-5 py-5 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-[15px] font-black uppercase tracking-wide leading-tight">
                    FILTER PRODUCTS
                  </h3>
                  <p className="text-[11px] text-sky-100 font-medium mt-1">
                    Refine your results
                  </p>
                </div>

                {filterCount > 0 && (
                  <span className="w-6 h-6 bg-white text-[#0A39A6] rounded-full text-[10px] font-black flex items-center justify-center">
                    {filterCount}
                  </span>
                )}
              </div>

              <div className="p-5">

                {/* CATEGORIES */}
                <FilterSection title="Categories">
                  <input
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="filter-input mb-2 rounded-lg"
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
                    className="filter-input mb-2 rounded-lg"
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
                    className="filter-input mb-3 rounded-lg"
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
                            className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                              selected
                                ? 'bg-[#0A39A6] border-[#0A39A6] text-white shadow-sm'
                                : 'bg-white border-blue-200 text-[#0A39A6] hover:bg-blue-50'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyText>
                      {tagsLoading ? 'Loading tags...' : tagSearch ? 'No matching tags' : 'No tags available for published products'}
                    </EmptyText>
                  )}
                </FilterSection>

                {/* PRICE — screenshot-style dropdowns and one dual-handle track */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-[0_3px_18px_rgba(15,23,42,0.04)]">
                  <div className="mb-4 flex items-center justify-between gap-2"><h3 className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800">FILTER BY PRICE</h3><span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#0A39A6]">MMK</span></div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block min-w-0">
                      <span className="mb-1 block text-[11px] font-semibold text-slate-600">Minimum (MMK)</span>
                      <select
                        aria-label="Minimum price in MMK"
                        value={minPrice}
                        onChange={e => setMinPrice(Math.min(Number(e.target.value), maxPrice - MIN_HANDLE_GAP))}
                        className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-[#0A39A6] focus:ring-2 focus:ring-blue-100"
                      >
                        {PRICE_OPTIONS.concat(minPrice)
                          .filter((v, i, arr) => arr.indexOf(v) === i)
                          .sort((a, b) => a - b)
                          .map(value => (
                            <option key={value} value={value}>{value.toLocaleString('en-US')}</option>
                          ))}
                      </select>
                    </label>
                    <label className="block min-w-0">
                      <span className="mb-1 block text-[11px] font-semibold text-slate-600">Maximum (MMK)</span>
                      <select
                        aria-label="Maximum price in MMK"
                        value={maxPrice}
                        onChange={e => setMaxPrice(Math.max(Number(e.target.value), minPrice + MIN_HANDLE_GAP))}
                        className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-[#0A39A6] focus:ring-2 focus:ring-blue-100"
                      >
                        {PRICE_OPTIONS.concat(maxPrice)
                          .filter((v, i, arr) => arr.indexOf(v) === i)
                          .sort((a, b) => a - b)
                          .map(value => (
                            <option key={value} value={value}>{value.toLocaleString('en-US')}</option>
                          ))}
                      </select>
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Popular price ranges">
                    {[
                      { label: 'Under 100K', min: MIN_PRICE, max: 100_000 },
                      { label: '50K–500K', min: 50_000, max: 500_000 },
                      { label: '500K–2M', min: 500_000, max: 2_000_000 },
                      { label: '2M+', min: 2_000_000, max: MAX_PRICE }
                    ].map(preset => {
                      const selected = minPrice === preset.min && maxPrice === preset.max;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => { setMinPrice(preset.min); setMaxPrice(preset.max); }}
                          className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${selected ? 'border-[#0A39A6] bg-blue-50 text-[#0A39A6]' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50'}`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>Fine-tune your budget</span>
                    <span>Precise adjustment</span>
                  </div>
                  <div className="relative mt-3 h-11 flex items-center mx-3">
                    <div className="absolute left-0 right-0 h-[3px] bg-slate-300" />
                    <div
                      className="absolute h-[4px] bg-[#0A39A6]"
                      style={{
                        left: `${(priceToSlider(minPrice) / SLIDER_MAX) * 100}%`,
                        right: `${100 - (priceToSlider(maxPrice) / SLIDER_MAX) * 100}%`
                      }}
                    />
                    <input
                      aria-label="Adjust minimum price"
                      type="range"
                      min={0}
                      max={SLIDER_MAX}
                      step={1}
                      value={priceToSlider(minPrice)}
                      onChange={e => setMinPrice(Math.min(sliderToPrice(Number(e.target.value)), maxPrice - MIN_HANDLE_GAP))}
                      className="price-range-thumb absolute inset-x-0 w-full"
                      style={{ zIndex: minPrice >= maxPrice - MIN_HANDLE_GAP * 2 ? 5 : 3 }}
                    />
                    <input
                      aria-label="Adjust maximum price"
                      type="range"
                      min={0}
                      max={SLIDER_MAX}
                      step={1}
                      value={priceToSlider(maxPrice)}
                      onChange={e => setMaxPrice(Math.max(sliderToPrice(Number(e.target.value)), minPrice + MIN_HANDLE_GAP))}
                      className="price-range-thumb absolute inset-x-0 w-full"
                      style={{ zIndex: 4 }}
                    />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[10px] font-semibold text-slate-500">
                    <span>{minPrice.toLocaleString('en-US')} MMK</span>
                    <span>{maxPrice.toLocaleString('en-US')} MMK</span>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-400">Choose a budget or drag the handles · 10,000 MMK steps</p>
                  <button
                    type="button"
                    onClick={applyPrice}
                    className="mt-3 w-full rounded-xl bg-[#0A39A6] px-3 py-3 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#082E86] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    APPLY PRICE
                  </button>
                  {(activeMinPrice || activeMaxPrice) && (
                    <button
                      type="button"
                      onClick={clearPrice}
                      className="mt-2 w-full text-[11px] font-semibold text-slate-500 hover:text-[#0A39A6]"
                    >
                      Reset price
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full rounded-lg border border-gray-200 py-2.5 text-[11px] font-bold hover:bg-gray-50"
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
                    {Number(activeMinPrice || MIN_PRICE).toLocaleString('en-US')} - {Number(activeMaxPrice || MAX_PRICE).toLocaleString('en-US')} MMK ×
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
              <div className="mt-12 flex items-center justify-center space-x-2">
                <button
                  type="button"
                  disabled={productsPage.first}
                  onClick={() => {
                    updateFilters({ page: activePage - 1 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-lg border border-border-subtle bg-white text-sm font-semibold text-text-main hover:bg-page hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: productsPage.totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        updateFilters({ page: idx });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                        activePage === idx
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-text-main border border-border-subtle hover:bg-page hover:text-primary'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={productsPage.last}
                  onClick={() => {
                    updateFilters({ page: activePage + 1 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-lg border border-border-subtle bg-white text-sm font-semibold text-text-main hover:bg-page hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Small shared CSS */}
      <style>{`
        /* Two circular handles on one shared price track; dropdowns and handles stay synchronized */
        .price-range-thumb {
          position: absolute;
          left: 0;
          width: 100%;
          height: 40px;
          margin: 0;
          padding: 0;
          background: transparent;
          appearance: none;
          -webkit-appearance: none;
          pointer-events: none;
          cursor: pointer;
        }
        .price-range-thumb::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
          border: 0;
        }
        .price-range-thumb::-moz-range-track {
          height: 4px;
          background: transparent;
          border: 0;
        }
        .price-range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          margin-top: -6px;
          border: 2.5px solid #0A39A6;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 5px rgba(15,23,42,.16);
          pointer-events: auto;
          cursor: grab;
          transition: box-shadow .15s ease, transform .15s ease;
        }
        .price-range-thumb::-moz-range-thumb {
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 2.5px solid #0A39A6;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 5px rgba(15,23,42,.16);
          pointer-events: auto;
          cursor: grab;
        }
        .price-range-thumb:active::-webkit-slider-thumb {
          cursor: grabbing;
          box-shadow: 0 0 0 4px rgba(10, 57, 166, .10);
        }
        .price-range-thumb:focus-visible::-webkit-slider-thumb {
          outline: 3px solid #bfdbfe;
          outline-offset: 2px;
        }
        .price-range-thumb:focus-visible::-moz-range-thumb {
          outline: 3px solid #bfdbfe;
          outline-offset: 2px;
        }
        .filter-input {
          width: 100%;
          padding: 8px 10px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          font-size: 12px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }

        .filter-input:focus {
          border-color: #0284C7;
          box-shadow: 0 0 0 3px rgba(2,132,199,.10);
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