export interface ProductListResponse {
  productId: number;
  productName: string;
  categoryName: string;
  brandName: string | null;
  primaryImageUrl: string | null;
  startingPrice: number | null;
  status: string;
  stockStatus: string;
  tags: string[];
}

export interface BrandResponse {
  brandId: number;
  brandName: string;
  brandLogoUrl: string | null;
}

export interface ProductImageResponse {
  imageId: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface VariantOptionResponse {
  variationId: number;
  variationName: string;
  optionId: number;
  value: string;
}

export interface ProductVariantResponse {
  variantId: number;
  sku: string;
  sellingPrice: number;
  discountPrice: number | null;
  status: string;
  availableQuantity: number;
  stockStatus: string;
  options: VariantOptionResponse[];
}

export interface ProductDetailResponse {
  productId: number;
  productName: string;
  description: string | null;
  categoryId: number;
  categoryName: string;
  brand: BrandResponse | null;
  status: string;
  images: ProductImageResponse[];
  variants: ProductVariantResponse[];
  tags: string[];
}

export interface CategoryNodeResponse {
  categoryId: number;
  categoryName: string;
  children: CategoryNodeResponse[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
