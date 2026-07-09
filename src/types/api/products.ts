/** Admin product API types — aligned with docs.json OpenAPI spec */

export type AdminProductStatus = "draft" | "active" | "archived";

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AdminBrand {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateBrandPayload {
  name?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug?: string;
  parent_id?: string;
  is_active?: boolean;
  children?: AdminCategory[];
}

export interface CatalogAttribute {
  id: string;
  name: string;
  slug?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CatalogAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateCatalogAttributePayload {
  name: string;
  slug?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateCatalogAttributePayload {
  name?: string;
  slug?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateCatalogAttributeValuePayload {
  attribute_id: string;
  value: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateCatalogAttributeValuePayload {
  value?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ProductAttributePayload {
  name: string;
  values: string[];
}

export interface ProductImagePayload {
  url: string;
  alt_text?: string;
  sort_order?: number;
}

export interface ProductInventoryPayload {
  quantity?: number;
  low_stock_threshold?: number;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  description?: string;
  short_description?: string;
  slug?: string;
  brand?: string;
  category_id?: string;
  status?: AdminProductStatus;
  is_featured?: boolean;
  sale_price?: number;
  attributes?: ProductAttributePayload[];
  images?: ProductImagePayload[];
  inventory?: ProductInventoryPayload;
}

export interface SkuResponse {
  id: string;
  code: string;
  attributes?: Record<string, string>;
}

export interface ProductInventoryResponse {
  quantity: number;
  low_stock_threshold?: number;
  is_low_stock?: boolean;
  is_out_of_stock?: boolean;
}

export interface AdminProductResponse {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  brand?: string;
  category_id?: string;
  status: AdminProductStatus;
  is_featured?: boolean;
  attributes?: { id: string; name: string; values: string[] }[];
  images?: { id: string; url: string; alt_text?: string; sort_order?: number }[];
  inventory?: ProductInventoryResponse;
  skus?: SkuResponse[];
  created_at?: string;
  updated_at?: string;
}

export interface UploadResponse {
  url: string;
  filename?: string;
  content_type?: string;
  size?: number;
}
