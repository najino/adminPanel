import { apiClient } from "@/api/client";
import { IS_MOCK_MODE } from "@/config/mock";
import {
  getMockContextSection,
  setMockContextSection,
  getMockStoreStyle,
  setMockStoreStyle,
} from "@/lib/mock-store";
import {
  mockProducts,
  mockDashboardStats,
  mockChartData,
  mockOrders,
  mockCustomers,
  mockCoupons,
  mockCategories,
  mockPosts,
  mockComments,
  mockContactMessages,
  mockGeneralSettings,
  mockSeoSettings,
  mockThemes,
  mockPostCategories,
} from "@/lib/mock-data";
import type {
  Product,
  Order,
  Customer,
  Coupon,
  DashboardStats,
  ChartDataPoint,
  Category,
  BlogPost,
  BlogComment,
  ContactMessage,
  GeneralSettings,
  SeoSettings,
  PaginatedResponse,
} from "@/types";

const USE_MOCK = IS_MOCK_MODE;

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    await delay();
    return mockDashboardStats;
  }
  const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
  return data;
}

export async function getChartData(
  period: "monthly" | "quarterly" | "annually",
): Promise<ChartDataPoint[]> {
  if (USE_MOCK) {
    await delay();
    return mockChartData;
  }
  const { data } = await apiClient.get<ChartDataPoint[]>("/dashboard/chart", {
    params: { period },
  });
  return data;
}

export async function getProducts(params?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<Product[]> {
  if (USE_MOCK) {
    await delay();
    let result = [...mockProducts];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (params?.category) {
      result = result.filter((p) => p.category === params.category);
    }
    if (params?.status) {
      result = result.filter((p) => p.status === params.status);
    }
    return result;
  }
  const { data } = await apiClient.get<PaginatedResponse<Product>>("/products", { params });
  return data.data;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  if (USE_MOCK) {
    await delay();
    return mockProducts.find((p) => p.id === id);
  }
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  if (USE_MOCK) {
    await delay();
    const newProduct: Product = {
      id: String(Date.now()),
      name: product.name ?? "",
      description: product.description ?? "",
      sku: product.sku ?? "",
      price: product.price ?? 0,
      compareAtPrice: product.compareAtPrice,
      cost: product.cost,
      category: product.category ?? "",
      tags: product.tags ?? [],
      brand: product.brand ?? "",
      status: product.status ?? "active",
      stock: product.stock ?? 0,
      images: product.images ?? [],
      attributes: product.attributes ?? [],
    };
    mockProducts.push(newProduct);
    return newProduct;
  }
  const { data } = await apiClient.post<Product>("/products", product);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx >= 0) mockProducts.splice(idx, 1);
    return;
  }
  await apiClient.delete(`/products/${id}`);
}

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCK) {
    await delay();
    return mockCategories;
  }
  const { data } = await apiClient.get<Category[]>("/products/settings/categories");
  return data;
}

export async function createCategory(name: string): Promise<Category> {
  if (USE_MOCK) {
    await delay();
    const cat = { id: String(Date.now()), name };
    mockCategories.push(cat);
    return cat;
  }
  const { data } = await apiClient.post<Category>("/products/settings/categories", { name });
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx >= 0) mockCategories.splice(idx, 1);
    return;
  }
  await apiClient.delete(`/products/settings/categories/${id}`);
}

export async function getOrders(params?: {
  status?: string;
  search?: string;
}): Promise<Order[]> {
  if (USE_MOCK) {
    await delay();
    let result = [...mockOrders];
    if (params?.status) {
      result = result.filter((o) => o.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q),
      );
    }
    return result;
  }
  const { data } = await apiClient.get<PaginatedResponse<Order>>("/orders", { params });
  return data.data;
}

export async function getOrder(id: string): Promise<Order | undefined> {
  if (USE_MOCK) {
    await delay();
    return mockOrders.find((o) => o.id === id);
  }
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  if (USE_MOCK) {
    await delay();
    const order = mockOrders.find((o) => o.id === id);
    if (order) order.status = status;
    return order!;
  }
  const { data } = await apiClient.patch<Order>(`/orders/${id}`, { status });
  return data;
}

export async function createOrder(payload: {
  customerName: string;
  productIds: string;
}): Promise<Order> {
  if (USE_MOCK) {
    await delay();
    const newOrder: Order = {
      id: `ORD-${String(mockOrders.length + 1).padStart(3, "0")}`,
      customerId: String(mockCustomers.length + 1),
      customerName: payload.customerName,
      products: payload.productIds.split(",").map((p) => p.trim()),
      date: new Date().toISOString(),
      amount: 0,
      status: "pending",
    };
    mockOrders.unshift(newOrder);
    return newOrder;
  }
  const { data } = await apiClient.post<Order>("/orders", payload);
  return data;
}

export async function getCustomers(): Promise<Customer[]> {
  if (USE_MOCK) {
    await delay();
    return mockCustomers;
  }
  const { data } = await apiClient.get<PaginatedResponse<Customer>>("/users");
  return data.data;
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  if (USE_MOCK) {
    await delay();
    return mockCustomers.find((c) => c.id === id);
  }
  const { data } = await apiClient.get<Customer>(`/users/${id}`);
  return data;
}

export async function getCoupons(): Promise<Coupon[]> {
  if (USE_MOCK) {
    await delay();
    return mockCoupons;
  }
  const { data } = await apiClient.get<Coupon[]>("/coupons");
  return data;
}

export async function createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  if (USE_MOCK) {
    await delay();
    const newCoupon: Coupon = {
      id: String(Date.now()),
      couponCode: coupon.couponCode ?? "",
      discountType: coupon.discountType ?? "percent",
      discountValue: coupon.discountValue ?? 0,
      expiryDate: coupon.expiryDate ?? "",
      minOrder: coupon.minOrder ?? 0,
      usageLimit: coupon.usageLimit ?? 0,
      usage: 0,
      status: "active",
    };
    mockCoupons.push(newCoupon);
    return newCoupon;
  }
  const { data } = await apiClient.post<Coupon>("/coupons", coupon);
  return data;
}

export async function deleteCoupon(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockCoupons.findIndex((c) => c.id === id);
    if (idx >= 0) mockCoupons.splice(idx, 1);
    return;
  }
  await apiClient.delete(`/coupons/${id}`);
}

export async function getPosts(): Promise<BlogPost[]> {
  if (USE_MOCK) {
    await delay();
    return mockPosts;
  }
  const { data } = await apiClient.get<BlogPost[]>("/posts");
  return data;
}

export async function createPost(post: Partial<BlogPost>): Promise<BlogPost> {
  if (USE_MOCK) {
    await delay();
    const newPost: BlogPost = {
      id: String(Date.now()),
      title: post.title ?? "",
      slug: post.slug ?? "",
      author: "Admin",
      category: post.category ?? "",
      status: post.status ?? "Draft",
      publishedDate: post.publishedDate ?? new Date().toISOString().split("T")[0],
      tags: post.tags ?? [],
      content: post.content,
      featuredImage: post.featuredImage,
    };
    mockPosts.push(newPost);
    return newPost;
  }
  const { data } = await apiClient.post<BlogPost>("/posts", post);
  return data;
}

export async function getPostCategories(): Promise<string[]> {
  if (USE_MOCK) {
    await delay();
    return [...mockPostCategories];
  }
  const { data } = await apiClient.get<string[]>("/posts/categories");
  return data;
}

export async function createPostCategory(name: string): Promise<string> {
  if (USE_MOCK) {
    await delay();
    if (!mockPostCategories.includes(name)) mockPostCategories.push(name);
    return name;
  }
  const { data } = await apiClient.post<string>("/posts/categories", { name });
  return data;
}

export async function deletePostCategory(name: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockPostCategories.indexOf(name);
    if (idx >= 0) mockPostCategories.splice(idx, 1);
    return;
  }
  await apiClient.delete(`/posts/categories/${encodeURIComponent(name)}`);
}

export async function updateComment(
  id: string,
  updates: Partial<BlogComment>,
): Promise<BlogComment> {
  if (USE_MOCK) {
    await delay();
    const comment = mockComments.find((c) => c.id === id);
    if (comment) Object.assign(comment, updates);
    return comment!;
  }
  const { data } = await apiClient.patch<BlogComment>(`/comments/${id}`, updates);
  return data;
}

export async function deleteComment(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockComments.findIndex((c) => c.id === id);
    if (idx >= 0) mockComments.splice(idx, 1);
    return;
  }
  await apiClient.delete(`/comments/${id}`);
}

export async function getComments(): Promise<BlogComment[]> {
  if (USE_MOCK) {
    await delay();
    return mockComments;
  }
  const { data } = await apiClient.get<BlogComment[]>("/comments");
  return data;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (USE_MOCK) {
    await delay();
    return mockContactMessages;
  }
  const { data } = await apiClient.get<ContactMessage[]>("/contact-messages");
  return data;
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockContactMessages.findIndex((m) => m.id === id);
    if (idx >= 0) mockContactMessages.splice(idx, 1);
    return;
  }
  await apiClient.delete(`/contact-messages/${id}`);
}

export async function getGeneralSettings(): Promise<GeneralSettings> {
  if (USE_MOCK) {
    await delay();
    return mockGeneralSettings;
  }
  const { data } = await apiClient.get<GeneralSettings>("/settings/general");
  return data;
}

export async function updateGeneralSettings(settings: Partial<GeneralSettings>): Promise<GeneralSettings> {
  if (USE_MOCK) {
    await delay();
    Object.assign(mockGeneralSettings, settings);
    return mockGeneralSettings;
  }
  const { data } = await apiClient.patch<GeneralSettings>("/settings/general", settings);
  return data;
}

export async function getSeoSettings(): Promise<SeoSettings> {
  if (USE_MOCK) {
    await delay();
    return mockSeoSettings;
  }
  const { data } = await apiClient.get<SeoSettings>("/settings/seo");
  return data;
}

export async function updateSeoSettings(settings: Partial<SeoSettings>): Promise<SeoSettings> {
  if (USE_MOCK) {
    await delay();
    Object.assign(mockSeoSettings, settings);
    return mockSeoSettings;
  }
  const { data } = await apiClient.patch<SeoSettings>("/settings/seo", settings);
  return data;
}

export async function getThemes() {
  if (USE_MOCK) {
    await delay();
    return mockThemes;
  }
  const { data } = await apiClient.get("/themes");
  return data;
}

export async function getContextSection(section: string) {
  if (USE_MOCK) {
    await delay();
    return getMockContextSection(section);
  }
  const { data } = await apiClient.get(`/context/${section}`);
  return data;
}

export async function updateContextSection(section: string, payload: unknown) {
  if (USE_MOCK) {
    await delay();
    return setMockContextSection(section, payload);
  }
  const { data } = await apiClient.patch(`/context/${section}`, payload);
  return data;
}

export async function getStoreStyle() {
  if (USE_MOCK) {
    await delay();
    return getMockStoreStyle();
  }
  const { data } = await apiClient.get("/store/style");
  return data;
}

export async function updateStoreStyle(payload: unknown) {
  if (USE_MOCK) {
    await delay();
    return setMockStoreStyle(payload as Record<string, unknown>);
  }
  const { data } = await apiClient.patch("/store/style", payload);
  return data;
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  if (USE_MOCK) {
    await delay(800);
    return { url: URL.createObjectURL(file) };
  }
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ url: string }>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
