import React, { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";

import { productApi } from "../../product/api/productApi";
import { ProductCard } from "../../../components/product/ProductCard";
import { GeometricPatternBanner } from "../../../components/common/GeometricPatternBanner";
import { Pagination } from "../../../components/common/Pagination";

import type {
  CategoryNodeResponse,
  ProductListResponse,
  PageResponse,
} from "../../product/types";

export const CategoryDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState<CategoryNodeResponse | null>(null);

  const [productsPage, setProductsPage] =
    useState<PageResponse<ProductListResponse> | null>(null);

  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);

  const activeSort = searchParams.get("sort") || "newest";

  const rawPage = Number(searchParams.get("page") ?? "0");
  const activePage =
    Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;

  const parsedCategoryId = Number(categoryId);
  const isValidCategoryId =
    Boolean(categoryId) &&
    Number.isSafeInteger(parsedCategoryId) &&
    parsedCategoryId > 0;

  const findCategory = (
    nodes: CategoryNodeResponse[],
    id: number,
  ): CategoryNodeResponse | null => {
    for (const node of nodes) {
      if (node.categoryId === id) {
        return node;
      }

      if (node.children && node.children.length > 0) {
        const found = findCategory(node.children, id);

        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  useEffect(() => {
    let cancelled = false;

    setLoadingCategory(true);
    setCategory(null);
    setCategoryError(null);

    if (!isValidCategoryId) {
      setLoadingCategory(false);
      return;
    }

    productApi
      .getCategoryTree()
      .then((res) => {
        if (cancelled) return;

        const found = findCategory(res ?? [], parsedCategoryId);

        setCategory(found);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Failed to load category:", error);
        setCategory(null);
        setCategoryError("Unable to load category. Please try again.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCategory(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  useEffect(() => {
    let cancelled = false;

    setLoadingProducts(true);
    setProductsPage(null);
    setProductsError(null);

    if (!isValidCategoryId) {
      setLoadingProducts(false);
      return;
    }

    const params = {
      categoryId: parsedCategoryId,
      sort: activeSort,
      page: activePage,
    };

    productApi
      .getProducts(params)
      .then((res) => {
        if (cancelled) return;

        setProductsPage(res);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Failed to load category products:", error);
        setProductsPage(null);
        setProductsError("Unable to load products. Please try again.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, activeSort, activePage]);

  const updateFilters = (
    newParams: Record<string, string | number | null | undefined>,
  ) => {
    const nextParams = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(newParams)) {
      if (value === null || value === undefined || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    }

    if (!Object.prototype.hasOwnProperty.call(newParams, "page")) {
      nextParams.set("page", "0");
    }

    setSearchParams(nextParams);
  };

  if (loadingCategory) {
    return (
      <div className="text-center py-20 text-gray-500">Loading category...</div>
    );
  }

  if (categoryError) {
    return (
      <div className="min-h-screen bg-page pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">{categoryError}</h2>

          <Link to="/categories" className="text-primary hover:underline">
            Return to Categories
          </Link>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-page pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-500">
          <h2 className="text-2xl font-bold mb-4">Category not found</h2>

          <Link to="/categories" className="text-primary hover:underline">
            Return to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="py-6 text-sm text-gray-500">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          {" / "}
          <Link to="/categories" className="hover:underline">
            Categories
          </Link>
          {" / "}
          {category.categoryName}
        </div>

        {/* ============================================================== */}
        {/* Category Banner - ✨ Deep Charcoal with Purple Glow (like Home) */}
        {/* ============================================================== */}
        <div className="relative overflow-hidden bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md mb-8 flex items-center justify-between min-h-[160px]">
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(139,92,246,0.15),transparent_60%)] pointer-events-none z-0"></div>

          <div className="relative z-10 max-w-xl">
            <div className="text-sky-200 font-bold text-[13px] tracking-wider uppercase mb-1">
              CATEGORY
            </div>
            <h1 className="text-3xl sm:text-[34px] font-black my-1.5 drop-shadow-sm">
              {category.categoryName}
            </h1>
            <p className="text-sky-100 text-sm max-w-xl m-0 font-medium">
              {category.children?.length
                ? `Explore ${category.children.length} subcategories and their products.`
                : "Browse all products in this category."}
            </p>
          </div>
          <div className="hidden sm:flex relative z-10 flex-shrink-0 items-center justify-end w-[260px] md:w-[320px] lg:w-[360px] h-[120px] md:h-[140px]">
            <GeometricPatternBanner className="w-full h-full" />
          </div>
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Subcategories</h2>

            <div className="flex flex-wrap gap-3">
              {category.children.map((child) => (
                <button
                  key={child.categoryId}
                  type="button"
                  onClick={() => navigate(`/categories/${child.categoryId}`)}
                  className="bg-white border border-border-subtle px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors rounded"
                >
                  {child.categoryName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Count and Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-[18px]">
          <div className="text-xs text-gray-500">
            {loadingProducts
              ? "Loading products..."
              : productsError
                ? "Unable to load products"
                : `Showing ${productsPage?.totalElements ?? 0} products`}
          </div>

          <select
            value={activeSort}
            onChange={(e) =>
              updateFilters({
                sort: e.target.value,
                page: 0,
              })
            }
            className="p-2 border text-sm bg-white"
          >
            <option value="newest">Newest</option>
            <option value="priceAsc">Price Low → High</option>
            <option value="priceDesc">Price High → Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Product Content */}
        {loadingProducts ? (
          <div className="text-center py-12 text-gray-500">
            Loading products...
          </div>
        ) : productsError ? (
          <div className="bg-white border p-12 text-center text-red-500 rounded">
            {productsError}
          </div>
        ) : !productsPage || productsPage.content.length === 0 ? (
          <div className="bg-white border p-12 text-center text-gray-500 rounded">
            No products available for this category.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
              {productsPage.content.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>

            {productsPage && (
              <Pagination
                currentPage={activePage + 1}
                totalPages={productsPage.totalPages}
                onPageChange={(page) => updateFilters({ page: page - 1 })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
