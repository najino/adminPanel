import { apiClient } from "@/api/client";
import { IS_MOCK_MODE } from "@/config/mock";
import { mockCategories, mockProducts } from "@/lib/mock-data";
import type {
  AdminBrand,
  AdminCategory,
  AdminProductResponse,
  CatalogAttribute,
  CatalogAttributeValue,
  CreateBrandPayload,
  CreateCatalogAttributePayload,
  CreateCatalogAttributeValuePayload,
  CreateProductPayload,
  UpdateProductPayload,
  PaginatedData,
  UpdateBrandPayload,
  UpdateCatalogAttributePayload,
  UpdateCatalogAttributeValuePayload,
  UploadResponse,
  AdminProductReview,
  ProductReviewStatus,
} from "@/types/api/products";
import { slugify } from "@/lib/utils";

const USE_MOCK = IS_MOCK_MODE;
const ADMIN = "/admin";

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockProductReviews: AdminProductReview[] = [
  {
    id: "rev-1",
    productId: "1",
    productName: "Wireless Headphones",
    authorName: "Ali Rezaei",
    title: "Great sound",
    content: "Excellent quality for the price.",
    rating: 5,
    status: "approved",
    date: "2026-01-10",
  },
  {
    id: "rev-2",
    productId: "2",
    productName: "Running Shoes",
    authorName: "Sara Mohammadi",
    title: "Comfortable",
    content: "Very comfortable for daily runs.",
    rating: 4,
    status: "pending",
    date: "2026-01-18",
  },
  {
    id: "rev-3",
    productId: "3",
    productName: "Leather Bag",
    authorName: "Reza Karimi",
    content: "Material feels cheap.",
    rating: 2,
    status: "rejected",
    date: "2026-01-20",
  },
];

function mapProductReview(item: Record<string, unknown>): AdminProductReview {
  const statusRaw = String(item.status ?? "").toLowerCase();
  const status: ProductReviewStatus =
    statusRaw === "approved" ? "approved" : statusRaw === "rejected" ? "rejected" : "pending";

  return {
    id: String(item.id ?? ""),
    productId: String(item.product_id ?? ""),
    productName: String(item.product_name ?? ""),
    authorName: String(item.author_name ?? ""),
    title: item.title ? String(item.title) : undefined,
    content: String(item.content ?? ""),
    rating: Number(item.rating ?? 0),
    status,
    date: String(item.created_at ?? ""),
  };
}

export const mockBrands: AdminBrand[] = [
  { id: "brand-1", name: "Apple", slug: "apple", logo_url: "", is_active: true },
  { id: "brand-2", name: "Samsung", slug: "samsung", logo_url: "", is_active: true },
  { id: "brand-3", name: "Nike", slug: "nike", logo_url: "", is_active: true },
  { id: "brand-4", name: "Adidas", slug: "adidas", logo_url: "", is_active: true },
];

export const mockCatalogAttributes: CatalogAttribute[] = [
  { id: "attr-color", name: "Color", slug: "color", is_active: true, sort_order: 0 },
  { id: "attr-size", name: "Size", slug: "size", is_active: true, sort_order: 1 },
  { id: "attr-material", name: "Material", slug: "material", is_active: true, sort_order: 2 },
];

export const mockCatalogAttributeValues: CatalogAttributeValue[] = [
  { id: "val-1", attribute_id: "attr-color", value: "Black", is_active: true },
  { id: "val-2", attribute_id: "attr-color", value: "White", is_active: true },
  { id: "val-3", attribute_id: "attr-color", value: "Blue", is_active: true },
  { id: "val-4", attribute_id: "attr-size", value: "S", is_active: true },
  { id: "val-5", attribute_id: "attr-size", value: "M", is_active: true },
  { id: "val-6", attribute_id: "attr-size", value: "L", is_active: true },
  { id: "val-7", attribute_id: "attr-material", value: "Cotton", is_active: true },
  { id: "val-8", attribute_id: "attr-material", value: "Leather", is_active: true },
];

function cartesianSkus(
  attributes: { name: string; values: string[] }[],
  productId: string,
): { id: string; code: string; attributes: Record<string, string> }[] {
  if (!attributes.length) {
    return [
      {
        id: `sku-${productId}-default`,
        code: `SKU-${productId.slice(-6).toUpperCase()}`,
        attributes: {},
      },
    ];
  }

  const combos: Record<string, string>[] = [{}];
  for (const attr of attributes) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const value of attr.values) {
        next.push({ ...combo, [attr.name]: value });
      }
    }
    combos.splice(0, combos.length, ...next);
  }

  return combos.map((attrs, i) => {
    const suffix = Object.values(attrs)
      .join("-")
      .replace(/\s+/g, "")
      .toUpperCase()
      .slice(0, 12);
    return {
      id: `sku-${productId}-${i}`,
      code: suffix ? `SKU-${suffix}` : `SKU-${productId.slice(-6).toUpperCase()}-${i + 1}`,
      attributes: attrs,
    };
  });
}

export async function getAdminBrands(): Promise<AdminBrand[]> {
  if (USE_MOCK) {
    await delay();
    return mockBrands.filter((b) => b.is_active !== false);
  }
  const { data } = await apiClient.get<PaginatedData<AdminBrand>>(`${ADMIN}/brands`, {
    params: { per_page: 100 },
  });
  return data.data;
}

export async function createAdminBrand(payload: CreateBrandPayload): Promise<AdminBrand> {
  if (USE_MOCK) {
    await delay();
    const brand: AdminBrand = {
      id: `brand-${Date.now()}`,
      name: payload.name,
      slug: payload.slug ?? slugify(payload.name),
      description: payload.description,
      logo_url: payload.logo_url,
      is_active: payload.is_active ?? true,
    };
    mockBrands.push(brand);
    return brand;
  }
  const { data } = await apiClient.post<AdminBrand>(`${ADMIN}/brands`, {
    name: payload.name,
    slug: payload.slug || slugify(payload.name),
    description: payload.description,
    logo_url: payload.logo_url,
    is_active: payload.is_active ?? true,
  });
  return data;
}

export async function updateAdminBrand(id: string, payload: UpdateBrandPayload): Promise<AdminBrand> {
  if (USE_MOCK) {
    await delay();
    const idx = mockBrands.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Brand not found");
    mockBrands[idx] = { ...mockBrands[idx], ...payload };
    return mockBrands[idx];
  }
  const { data } = await apiClient.put<AdminBrand>(`${ADMIN}/brands/${id}`, payload);
  return data;
}

export async function deleteAdminBrand(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockBrands.findIndex((b) => b.id === id);
    if (idx !== -1) mockBrands.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${ADMIN}/brands/${id}`);
}

export async function getAdminCategories(tree = false): Promise<AdminCategory[]> {
  if (USE_MOCK) {
    await delay();
    return mockCategories.map((c) => ({
      id: c.id,
      name: c.name,
      is_active: true,
    }));
  }
  const { data } = await apiClient.get<PaginatedData<AdminCategory>>(`${ADMIN}/categories`, {
    params: { per_page: 100, is_active: true, tree },
  });
  return data.data;
}

export async function getCatalogAttributes(): Promise<CatalogAttribute[]> {
  if (USE_MOCK) {
    await delay();
    return mockCatalogAttributes.filter((a) => a.is_active !== false);
  }
  const { data } = await apiClient.get<PaginatedData<CatalogAttribute>>(
    `${ADMIN}/product-attributes`,
    { params: { per_page: 100 } },
  );
  return data.data;
}

export async function getCatalogAttributeValues(
  attributeId: string,
): Promise<CatalogAttributeValue[]> {
  if (USE_MOCK) {
    await delay(150);
    return mockCatalogAttributeValues.filter(
      (v) => v.attribute_id === attributeId && v.is_active !== false,
    );
  }
  const { data } = await apiClient.get<PaginatedData<CatalogAttributeValue>>(
    `${ADMIN}/product-attribute-values`,
    { params: { attribute_id: attributeId, per_page: 100 } },
  );
  return data.data;
}

export async function createCatalogAttribute(
  payload: CreateCatalogAttributePayload,
): Promise<CatalogAttribute> {
  if (USE_MOCK) {
    await delay();
    const attr: CatalogAttribute = {
      id: `attr-${Date.now()}`,
      name: payload.name,
      slug: payload.slug,
      is_active: payload.is_active ?? true,
      sort_order: payload.sort_order ?? mockCatalogAttributes.length,
    };
    mockCatalogAttributes.push(attr);
    return attr;
  }
  const { data } = await apiClient.post<CatalogAttribute>(`${ADMIN}/product-attributes`, payload);
  return data;
}

export async function updateCatalogAttribute(
  id: string,
  payload: UpdateCatalogAttributePayload,
): Promise<CatalogAttribute> {
  if (USE_MOCK) {
    await delay();
    const idx = mockCatalogAttributes.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Attribute not found");
    mockCatalogAttributes[idx] = { ...mockCatalogAttributes[idx], ...payload };
    return mockCatalogAttributes[idx];
  }
  const { data } = await apiClient.put<CatalogAttribute>(`${ADMIN}/product-attributes/${id}`, payload);
  return data;
}

export async function deleteCatalogAttribute(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockCatalogAttributes.findIndex((a) => a.id === id);
    if (idx !== -1) mockCatalogAttributes.splice(idx, 1);
    for (let i = mockCatalogAttributeValues.length - 1; i >= 0; i -= 1) {
      if (mockCatalogAttributeValues[i].attribute_id === id) {
        mockCatalogAttributeValues.splice(i, 1);
      }
    }
    return;
  }
  await apiClient.delete(`${ADMIN}/product-attributes/${id}`);
}

export async function createCatalogAttributeValue(
  payload: CreateCatalogAttributeValuePayload,
): Promise<CatalogAttributeValue> {
  if (USE_MOCK) {
    await delay(150);
    const value: CatalogAttributeValue = {
      id: `val-${Date.now()}`,
      attribute_id: payload.attribute_id,
      value: payload.value,
      is_active: payload.is_active ?? true,
      sort_order: payload.sort_order ?? 0,
    };
    mockCatalogAttributeValues.push(value);
    return value;
  }
  const { data } = await apiClient.post<CatalogAttributeValue>(
    `${ADMIN}/product-attribute-values`,
    payload,
  );
  return data;
}

export async function updateCatalogAttributeValue(
  id: string,
  payload: UpdateCatalogAttributeValuePayload,
): Promise<CatalogAttributeValue> {
  if (USE_MOCK) {
    await delay(150);
    const idx = mockCatalogAttributeValues.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error("Value not found");
    mockCatalogAttributeValues[idx] = { ...mockCatalogAttributeValues[idx], ...payload };
    return mockCatalogAttributeValues[idx];
  }
  const { data } = await apiClient.put<CatalogAttributeValue>(
    `${ADMIN}/product-attribute-values/${id}`,
    payload,
  );
  return data;
}

export async function deleteCatalogAttributeValue(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(150);
    const idx = mockCatalogAttributeValues.findIndex((v) => v.id === id);
    if (idx !== -1) mockCatalogAttributeValues.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${ADMIN}/product-attribute-values/${id}`);
}

export async function uploadProductImage(file: File): Promise<UploadResponse> {
  if (USE_MOCK) {
    await delay(400);
    return {
      url: URL.createObjectURL(file),
      filename: file.name,
      content_type: file.type,
      size: file.size,
    };
  }
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<UploadResponse>(`${ADMIN}/uploads`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function createAdminProduct(
  payload: CreateProductPayload,
): Promise<AdminProductResponse> {
  if (USE_MOCK) {
    await delay(500);
    const id = String(Date.now());
    const skus = cartesianSkus(payload.attributes ?? [], id);
    const categoryName =
      mockCategories.find((c) => c.id === payload.category_id)?.name ?? "";
    const response: AdminProductResponse = {
      id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      short_description: payload.short_description,
      price: payload.price,
      sale_price: payload.sale_price,
      brand: payload.brand,
      category_id: payload.category_id,
      status: payload.status ?? "draft",
      is_featured: payload.is_featured,
      attributes: payload.attributes?.map((a, i) => ({
        id: `attr-${id}-${i}`,
        name: a.name,
        values: a.values,
      })),
      images: payload.images?.map((img, i) => ({
        id: `img-${id}-${i}`,
        url: img.url,
        alt_text: img.alt_text,
        sort_order: img.sort_order ?? i,
      })),
      inventory: {
        quantity: payload.inventory?.quantity ?? 0,
        low_stock_threshold: payload.inventory?.low_stock_threshold ?? 5,
        is_low_stock: (payload.inventory?.quantity ?? 0) <= (payload.inventory?.low_stock_threshold ?? 5),
        is_out_of_stock: (payload.inventory?.quantity ?? 0) === 0,
      },
      skus,
      created_at: new Date().toISOString(),
    };
    mockProducts.push({
      id,
      name: payload.name,
      description: payload.description ?? "",
      sku: skus[0]?.code ?? `SKU-${id.slice(-6)}`,
      price: payload.price,
      compareAtPrice: payload.sale_price,
      category: categoryName,
      tags: [],
      brand: payload.brand ?? "",
      status: payload.status === "active" ? "active" : "inactive",
      stock: payload.inventory?.quantity ?? 0,
      images: payload.images?.map((i) => i.url) ?? [],
      attributes: payload.attributes?.map((a) => ({ key: a.name, values: a.values })) ?? [],
      variants: skus.length,
    });
    return response;
  }
  const { data } = await apiClient.post<AdminProductResponse>(`${ADMIN}/products`, payload);
  return data;
}

function mockProductToAdmin(product: (typeof mockProducts)[number]): AdminProductResponse {
  const category = mockCategories.find((c) => c.name === product.category);
  const status: AdminProductStatus =
    product.status === "active" || product.status === "lowStock" || product.status === "outOfStock"
      ? "active"
      : "draft";

  return {
    id: product.id,
    name: product.name,
    slug: slugify(product.name),
    description: product.description,
    short_description: undefined,
    price: product.price,
    sale_price: product.compareAtPrice,
    brand: product.brand,
    category_id: category?.id,
    status,
    is_featured: false,
    attributes: product.attributes?.map((a, i) => ({
      id: `attr-${product.id}-${i}`,
      name: a.key,
      values: a.values,
    })),
    images: product.images?.map((url, i) => ({
      id: `img-${product.id}-${i}`,
      url,
      sort_order: i,
    })),
    inventory: {
      quantity: product.stock,
      low_stock_threshold: 5,
      is_low_stock: product.stock <= 5,
      is_out_of_stock: product.stock === 0,
    },
    skus: [
      {
        id: `sku-${product.id}`,
        code: product.sku,
        attributes: Object.fromEntries(
          (product.attributes ?? []).map((a) => [a.key, a.values[0] ?? ""]),
        ),
      },
    ],
  };
}

export async function getAdminProduct(id: string): Promise<AdminProductResponse> {
  if (USE_MOCK) {
    await delay();
    const product = mockProducts.find((p) => p.id === id);
    if (!product) throw new Error("Product not found");
    return mockProductToAdmin(product);
  }
  const { data } = await apiClient.get<AdminProductResponse>(`${ADMIN}/products/${id}`);
  return data;
}

export async function updateAdminProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<AdminProductResponse> {
  if (USE_MOCK) {
    await delay(400);
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Product not found");

    const current = mockProducts[idx];
    const categoryName =
      payload.category_id !== undefined
        ? (mockCategories.find((c) => c.id === payload.category_id)?.name ?? current.category)
        : current.category;

    const quantity = payload.inventory?.quantity ?? current.stock;
    const skus =
      payload.attributes !== undefined
        ? cartesianSkus(payload.attributes, id)
        : [{ id: `sku-${id}`, code: current.sku, attributes: {} }];

    mockProducts[idx] = {
      ...current,
      name: payload.name ?? current.name,
      description: payload.description ?? current.description,
      price: payload.price ?? current.price,
      compareAtPrice:
        payload.sale_price !== undefined ? payload.sale_price : current.compareAtPrice,
      brand: payload.brand ?? current.brand,
      category: categoryName,
      status:
        payload.status === "active"
          ? quantity <= 5
            ? "lowStock"
            : "active"
          : payload.status === "archived"
            ? "outOfStock"
            : payload.status === "draft"
              ? "inactive"
              : current.status,
      stock: quantity,
      images: payload.images?.map((i) => i.url) ?? current.images,
      attributes:
        payload.attributes?.map((a) => ({ key: a.name, values: a.values })) ?? current.attributes,
      variants: skus.length,
      sku: skus[0]?.code ?? current.sku,
    };

    return mockProductToAdmin(mockProducts[idx]);
  }

  const { inventory, ...productPayload } = payload;
  const { data } = await apiClient.put<AdminProductResponse>(
    `${ADMIN}/products/${id}`,
    productPayload,
  );

  if (inventory) {
    await apiClient.patch(`${ADMIN}/products/${id}/inventory`, {
      quantity: inventory.quantity ?? 0,
      low_stock_threshold: inventory.low_stock_threshold,
      adjustment_reason: "admin_panel_update",
    });
    return getAdminProduct(id);
  }

  return data;
}

export async function getProductReviews(params?: {
  search?: string;
  status?: ProductReviewStatus;
}): Promise<AdminProductReview[]> {
  if (USE_MOCK) {
    await delay();
    let result = [...mockProductReviews];
    if (params?.status) result = result.filter((r) => r.status === params.status);
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.authorName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q),
      );
    }
    return result;
  }

  const query: Record<string, unknown> = { per_page: 100 };
  if (params?.status) query.status = params.status;
  if (params?.search) query.q = params.search;
  const { data } = await apiClient.get<PaginatedData<Record<string, unknown>>>(`${ADMIN}/reviews`, {
    params: query,
  });
  return (data.data ?? []).map(mapProductReview);
}

export async function updateProductReviewStatus(
  id: string,
  status: ProductReviewStatus,
): Promise<AdminProductReview> {
  if (USE_MOCK) {
    await delay();
    const review = mockProductReviews.find((r) => r.id === id);
    if (!review) throw new Error("Review not found");
    review.status = status;
    return { ...review };
  }
  const { data } = await apiClient.patch<Record<string, unknown>>(`${ADMIN}/reviews/${id}/status`, {
    status,
  });
  return mapProductReview(data);
}

export async function deleteProductReview(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockProductReviews.findIndex((r) => r.id === id);
    if (idx >= 0) mockProductReviews.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${ADMIN}/reviews/${id}`);
}
