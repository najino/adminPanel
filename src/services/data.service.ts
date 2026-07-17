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
  mockNotifications,
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
  AdminNotification,
} from "@/types";

const USE_MOCK = IS_MOCK_MODE;
const ADMIN = "/admin";

type ApiListResponse<T> = { data: T[]; meta?: unknown };

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

function toProductStatus(status?: string): Product["status"] {
  if (status === "active") return "active";
  if (status === "archived") return "outOfStock";
  if (status === "draft") return "inactive";
  return "inactive";
}

function toOrderStatus(status?: string): Order["status"] {
  if (status === "pending" || status === "processing" || status === "shipped" || status === "delivered" || status === "cancelled") {
    return status;
  }
  return "pending";
}

function mapProduct(item: Record<string, unknown>): Product {
  const inventory = (item.inventory ?? {}) as Record<string, unknown>;
  const attributes = Array.isArray(item.attributes)
    ? (item.attributes as Array<Record<string, unknown>>).map((a) => ({
        key: String(a.name ?? ""),
        values: Array.isArray(a.values) ? (a.values as string[]) : [],
      }))
    : [];
  const images = Array.isArray(item.images)
    ? (item.images as Array<Record<string, unknown>>).map((i) => String(i.url ?? "")).filter(Boolean)
    : [];

  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    description: String(item.description ?? item.short_description ?? ""),
    sku: String((Array.isArray(item.skus) && item.skus[0] && (item.skus[0] as Record<string, unknown>).code) ?? ""),
    price: Number(item.price ?? 0),
    compareAtPrice: item.sale_price !== undefined ? Number(item.sale_price) : undefined,
    category: String(item.category_name ?? item.category_id ?? ""),
    tags: [],
    brand: String(item.brand ?? ""),
    status: toProductStatus(String(item.status ?? "")),
    stock: Number(inventory.quantity ?? 0),
    images,
    attributes,
    variants: Array.isArray(item.skus) ? item.skus.length : attributes.reduce((p, c) => p * Math.max(c.values.length, 1), 1),
  };
}

function mapOrder(item: Record<string, unknown>): Order {
  const customer = (item.customer ?? {}) as Record<string, unknown>;
  const orderItems = Array.isArray(item.items) ? (item.items as Array<Record<string, unknown>>) : [];
  const products = orderItems
    .map((it) => String(it.product_name ?? ""))
    .filter(Boolean);

  return {
    id: String(item.id ?? item.order_number ?? ""),
    customerId: String(customer.id ?? item.customer_id ?? ""),
    customerName: String(customer.full_name ?? item.customer_name ?? ""),
    customerEmail: String(customer.email ?? ""),
    products,
    date: String(item.created_at ?? ""),
    amount: Number(item.total ?? 0),
    status: toOrderStatus(String(item.status ?? "")),
    paymentMethod: String(item.payment_method ?? ""),
    subtotal: item.subtotal !== undefined ? Number(item.subtotal) : undefined,
    shipping: item.shipping_amount !== undefined ? Number(item.shipping_amount) : undefined,
    tax: item.tax_amount !== undefined ? Number(item.tax_amount) : undefined,
    discount: item.discount_amount !== undefined ? Number(item.discount_amount) : undefined,
    items: orderItems.map((it) => ({
      productId: String(it.product_id ?? ""),
      productName: String(it.product_name ?? ""),
      variant: String(it.variant_name ?? ""),
      quantity: Number(it.quantity ?? 0),
      price: Number(it.unit_price ?? it.total_price ?? 0),
    })),
  };
}

function mapCustomer(item: Record<string, unknown>): Customer {
  return {
    id: String(item.id ?? ""),
    name: String(item.full_name ?? `${String(item.first_name ?? "")} ${String(item.last_name ?? "")}`.trim()),
    email: String(item.email ?? ""),
    phone: String(item.phone ?? ""),
    orders: Number(item.total_orders ?? 0),
    status: "active",
    city: String(item.city ?? ""),
    country: String(item.country ?? ""),
  };
}

function mapCoupon(item: Record<string, unknown>): Coupon {
  const discountType = String(item.discount_type ?? "") === "fixed_amount" ? "fixed" : "percent";
  const status: Coupon["status"] =
    item.is_expired ? "expired" : item.is_active ? "active" : "scheduled";
  return {
    id: String(item.id ?? ""),
    couponCode: String(item.code ?? ""),
    discountType,
    discountValue: Number(item.discount_value ?? 0),
    expiryDate: String(item.expires_at ?? ""),
    minOrder: Number(item.min_order_amount ?? 0),
    usageLimit: Number(item.max_usage ?? 0),
    usage: Number(item.usage_count ?? 0),
    status,
  };
}

function mapBlogPost(item: Record<string, unknown>): BlogPost {
  const statusRaw = String(item.status ?? "").toLowerCase();
  const status: BlogPost["status"] =
    statusRaw === "published" ? "Published" : statusRaw === "scheduled" ? "Scheduled" : "Draft";

  return {
    id: String(item.id ?? ""),
    title: String(item.title ?? ""),
    slug: String(item.slug ?? ""),
    author: String(item.author_name ?? "Admin"),
    category: String(item.category_name ?? ""),
    status,
    publishedDate: String(item.published_at ?? item.created_at ?? "").split("T")[0] ?? "",
    tags: [],
    content: String(item.content ?? ""),
    featuredImage: String(item.featured_image ?? ""),
  };
}

function mapBlogComment(item: Record<string, unknown>): BlogComment {
  const statusRaw = String(item.status ?? "").toLowerCase();
  const status: BlogComment["status"] =
    statusRaw === "approved" ? "approved" : statusRaw === "rejected" ? "rejected" : "pending";

  const repliesRaw = Array.isArray(item.replies) ? item.replies : [];
  const replies = repliesRaw.map((r, i) => {
    const reply = (r ?? {}) as Record<string, unknown>;
    return {
      id: String(reply.id ?? `reply-${i}`),
      author: String(reply.author_name ?? reply.author ?? "Admin"),
      content: String(reply.content ?? ""),
      date: String(reply.created_at ?? reply.date ?? ""),
    };
  });

  return {
    id: String(item.id ?? ""),
    postTitle: String(item.post_title ?? ""),
    author: String(item.author_name ?? ""),
    content: String(item.content ?? ""),
    status,
    read: true,
    date: String(item.created_at ?? ""),
    replies,
  };
}

function mapContactMessage(item: Record<string, unknown>): ContactMessage {
  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    email: String(item.email ?? ""),
    subject: String(item.subject ?? ""),
    message: String(item.message ?? ""),
    date: String(item.created_at ?? ""),
    replies: 0,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    await delay();
    return mockDashboardStats;
  }
  const { data } = await apiClient.get<Record<string, unknown>>(`${ADMIN}/dashboard/stats`);
  const growth = (data.growth ?? {}) as Record<string, unknown>;
  return {
    totalRevenue: Number(data.total_revenue ?? 0),
    totalOrders: Number(data.total_orders ?? 0),
    totalCustomers: Number(data.total_customers ?? 0),
    totalProducts: Number(data.total_products ?? 0),
    pendingOrders: Number(data.pending_orders ?? 0),
    lowStockProducts: Number(data.low_stock_count ?? 0),
    revenueTrend: Number(growth.total_revenue ?? 0),
    ordersTrend: Number(growth.total_orders ?? 0),
    customersTrend: Number(growth.total_customers ?? 0),
    productsTrend: Number(growth.total_products ?? 0),
    pendingTrend: Number(growth.pending_orders ?? 0),
    lowStockTrend: Number(growth.low_stock_count ?? 0),
  };
}

export async function getChartData(_period: "monthly" | "quarterly" | "annually"): Promise<ChartDataPoint[]> {
  if (USE_MOCK) {
    await delay();
    return mockChartData;
  }
  const { data } = await apiClient.get<{ data: Array<{ date: string; orders: number; revenue: number }> }>(`${ADMIN}/dashboard/revenue`);
  return (data.data ?? []).map((p) => ({
    month: p.date,
    sales: Number(p.orders ?? 0),
    revenue: Number(p.revenue ?? 0),
  }));
}

export async function getProducts(params?: { search?: string; category?: string; status?: string }): Promise<Product[]> {
  if (USE_MOCK) {
    await delay();
    let result = [...mockProducts];
    if (params?.search) result = result.filter((p) => p.name.toLowerCase().includes(params.search!.toLowerCase()));
    if (params?.category) result = result.filter((p) => p.category === params.category);
    if (params?.status) result = result.filter((p) => p.status === params.status);
    return result;
  }
  const query: Record<string, unknown> = { per_page: 100 };
  if (params?.search) {
    const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/products/search`, { params: { q: params.search, per_page: 100 } });
    return data.data.map(mapProduct);
  }
  if (params?.category) query.category_id = params.category;
  if (params?.status) query.status = params.status === "inactive" ? "draft" : params.status === "outOfStock" ? "archived" : params.status;
  const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/products`, { params: query });
  return data.data.map(mapProduct);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  if (USE_MOCK) {
    await delay();
    return mockProducts.find((p) => p.id === id);
  }
  const { data } = await apiClient.get<Record<string, unknown>>(`${ADMIN}/products/${id}`);
  return mapProduct(data);
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
  const payload = {
    name: product.name,
    description: product.description,
    brand: product.brand,
    price: product.price,
    sale_price: product.compareAtPrice,
    status: product.status === "active" ? "active" : "draft",
    images: (product.images ?? []).map((url, idx) => ({ url, sort_order: idx })),
    inventory: { quantity: product.stock ?? 0 },
    attributes: (product.attributes ?? []).map((a) => ({ name: a.key, values: a.values })),
  };
  const { data } = await apiClient.post<Record<string, unknown>>(`${ADMIN}/products`, payload);
  return mapProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx >= 0) mockProducts.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${ADMIN}/products/${id}`);
}

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCK) {
    await delay();
    return mockCategories;
  }
  const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/categories`, { params: { per_page: 100 } });
  return data.data.map((c) => ({ id: String(c.id ?? ""), name: String(c.name ?? "") }));
}

export async function createCategory(name: string): Promise<Category> {
  if (USE_MOCK) {
    await delay();
    const cat = { id: String(Date.now()), name };
    mockCategories.push(cat);
    return cat;
  }
  const { data } = await apiClient.post<Record<string, unknown>>(`${ADMIN}/categories`, { name });
  return { id: String(data.id ?? ""), name: String(data.name ?? name) };
}

export async function deleteCategory(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockCategories.findIndex((c) => c.id === id);
    if (idx >= 0) mockCategories.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${ADMIN}/categories/${id}`);
}

export async function getOrders(params?: { status?: string; search?: string }): Promise<Order[]> {
  if (USE_MOCK) {
    await delay();
    let result = [...mockOrders];
    if (params?.status) result = result.filter((o) => o.status === params.status);
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((o) => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
    }
    return result;
  }
  const query: Record<string, unknown> = { per_page: 100 };
  if (params?.status) query.status = params.status;
  if (params?.search) query.search = params.search;
  const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/orders`, { params: query });
  return data.data.map(mapOrder);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  if (USE_MOCK) {
    await delay();
    return mockOrders.find((o) => o.id === id);
  }
  const { data } = await apiClient.get<Record<string, unknown>>(`${ADMIN}/orders/${id}`);
  return mapOrder(data);
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  if (USE_MOCK) {
    await delay();
    const order = mockOrders.find((o) => o.id === id);
    if (order) order.status = status;
    return order!;
  }
  const { data } = await apiClient.patch<Record<string, unknown>>(`${ADMIN}/orders/${id}/status`, { status });
  return mapOrder(data);
}

export async function createOrder(payload: { customerName: string; productIds: string }): Promise<Order> {
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
  const items = payload.productIds.split(",").map((id) => ({ product_id: id.trim(), quantity: 1 }));
  const customer = mockCustomers.find((c) => c.name.toLowerCase() === payload.customerName.toLowerCase());
  const requestBody = {
    customer_id: customer?.id ?? payload.customerName,
    items,
    billing_address: { first_name: payload.customerName, last_name: "", line1: "-", city: "-", country: "-", postal_code: "-", phone: "-" },
    shipping_address: { first_name: payload.customerName, last_name: "", line1: "-", city: "-", country: "-", postal_code: "-", phone: "-" },
    payment_status: "unpaid",
  };
  const { data } = await apiClient.post<Record<string, unknown>>(`${ADMIN}/orders`, requestBody);
  return mapOrder(data);
}

export async function getCustomers(): Promise<Customer[]> {
  if (USE_MOCK) {
    await delay();
    return mockCustomers;
  }
  const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/customers`, { params: { per_page: 100 } });
  return data.data.map(mapCustomer);
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  if (USE_MOCK) {
    await delay();
    return mockCustomers.find((c) => c.id === id);
  }
  const { data } = await apiClient.get<Record<string, unknown>>(`${ADMIN}/customers/${id}`);
  return mapCustomer(data);
}

export async function getCoupons(): Promise<Coupon[]> {
  if (USE_MOCK) {
    await delay();
    return mockCoupons;
  }
  const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/coupons`, { params: { per_page: 100 } });
  return data.data.map(mapCoupon);
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
  const payload = {
    code: coupon.couponCode,
    discount_type: coupon.discountType === "fixed" ? "fixed_amount" : "percentage",
    discount_value: coupon.discountValue,
    expires_at: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString() : undefined,
    min_order_amount: coupon.minOrder,
    max_usage: coupon.usageLimit,
    is_active: true,
  };
  const { data } = await apiClient.post<Record<string, unknown>>(`${ADMIN}/coupons`, payload);
  return mapCoupon(data);
}

export async function deleteCoupon(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockCoupons.findIndex((c) => c.id === id);
    if (idx >= 0) mockCoupons.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${ADMIN}/coupons/${id}`);
}

export async function getPosts(): Promise<BlogPost[]> {
  if (USE_MOCK) {
    await delay();
    return mockPosts;
  }
  const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/blog/posts`, { params: { per_page: 100 } });
  return data.data.map(mapBlogPost);
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
  const payload = {
    title: post.title,
    slug: post.slug,
    content: post.content,
    featured_image: post.featuredImage,
    status: (post.status ?? "Draft").toLowerCase(),
  };
  const { data } = await apiClient.post<Record<string, unknown>>(`${ADMIN}/blog/posts`, payload);
  return mapBlogPost(data);
}

export async function getPostCategories(): Promise<string[]> {
  if (USE_MOCK) {
    await delay();
    return [...mockPostCategories];
  }
  const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/blog/categories`, { params: { per_page: 100 } });
  return data.data.map((c) => String(c.name ?? ""));
}

export async function createPostCategory(name: string): Promise<string> {
  if (USE_MOCK) {
    await delay();
    if (!mockPostCategories.includes(name)) mockPostCategories.push(name);
    return name;
  }
  const { data } = await apiClient.post<Record<string, unknown>>(`${ADMIN}/blog/categories`, { name });
  return String(data.name ?? name);
}

export async function deletePostCategory(name: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockPostCategories.indexOf(name);
    if (idx >= 0) mockPostCategories.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${ADMIN}/blog/categories/${encodeURIComponent(name)}`);
}

export async function updateComment(id: string, updates: Partial<BlogComment>): Promise<BlogComment> {
  if (USE_MOCK) {
    await delay();
    const comment = mockComments.find((c) => c.id === id);
    if (comment) Object.assign(comment, updates);
    return comment!;
  }
  if (updates.status) {
    const { data } = await apiClient.patch<Record<string, unknown>>(`${ADMIN}/blog/comments/${id}/status`, { status: updates.status });
    return mapBlogComment(data);
  }
  const { data } = await apiClient.patch<Record<string, unknown>>(`${ADMIN}/blog/comments/${id}`, { content: updates.content });
  return mapBlogComment(data);
}

export async function deleteComment(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockComments.findIndex((c) => c.id === id);
    if (idx >= 0) mockComments.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${ADMIN}/blog/comments/${id}`);
}

export async function replyToComment(id: string, content: string): Promise<BlogComment> {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Empty reply");

  if (USE_MOCK) {
    await delay();
    const comment = mockComments.find((c) => c.id === id);
    if (!comment) throw new Error("Comment not found");
    const reply = {
      id: `reply-${Date.now()}`,
      author: "Admin",
      content: trimmed,
      date: new Date().toISOString().slice(0, 10),
    };
    comment.replies = [...(comment.replies ?? []), reply];
    comment.read = true;
    if (comment.status === "pending") comment.status = "approved";
    return { ...comment, replies: [...(comment.replies ?? [])] };
  }

  try {
    const { data } = await apiClient.post<Record<string, unknown>>(
      `${ADMIN}/blog/comments/${id}/replies`,
      { content: trimmed },
    );
    return mapBlogComment(data);
  } catch {
    const { data } = await apiClient.patch<Record<string, unknown>>(`${ADMIN}/blog/comments/${id}`, {
      admin_reply: trimmed,
    });
    return mapBlogComment(data);
  }
}

export async function getComments(): Promise<BlogComment[]> {
  if (USE_MOCK) {
    await delay();
    return mockComments;
  }
  const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/blog/comments`, { params: { per_page: 100 } });
  return data.data.map(mapBlogComment);
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (USE_MOCK) {
    await delay();
    return mockContactMessages;
  }
  const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(`${ADMIN}/contact-messages`, { params: { per_page: 100 } });
  return data.data.map(mapContactMessage);
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockContactMessages.findIndex((m) => m.id === id);
    if (idx >= 0) mockContactMessages.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${ADMIN}/contact-messages/${id}`);
}

export async function getGeneralSettings(): Promise<GeneralSettings> {
  if (USE_MOCK) {
    await delay();
    return mockGeneralSettings;
  }
  const [{ data: site }, { data: contact }, { data: social }] = await Promise.all([
    apiClient.get<Record<string, unknown>>(`${ADMIN}/settings/site`),
    apiClient.get<Record<string, unknown>>(`${ADMIN}/settings/contact`),
    apiClient.get<Record<string, unknown>>(`${ADMIN}/settings/social`),
  ]);
  return {
    storeName: String(site.name ?? ""),
    logo: String(site.logo_url ?? ""),
    favicon: String(site.favicon_url ?? ""),
    contactEmail: String(contact.email ?? ""),
    contactPhone: String(contact.phone ?? ""),
    facebook: String(social.facebook ?? ""),
    twitter: String(social.twitter ?? ""),
    instagram: String(social.instagram ?? ""),
    youtube: String(social.youtube ?? ""),
  };
}

export async function updateGeneralSettings(settings: Partial<GeneralSettings>): Promise<GeneralSettings> {
  if (USE_MOCK) {
    await delay();
    Object.assign(mockGeneralSettings, settings);
    return mockGeneralSettings;
  }
  await Promise.all([
    apiClient.put(`${ADMIN}/settings/site`, {
      name: settings.storeName,
      logo_url: settings.logo,
      favicon_url: settings.favicon,
    }),
    apiClient.put(`${ADMIN}/settings/contact`, {
      email: settings.contactEmail,
      phone: settings.contactPhone,
    }),
    apiClient.put(`${ADMIN}/settings/social`, {
      facebook: settings.facebook,
      twitter: settings.twitter,
      instagram: settings.instagram,
      youtube: settings.youtube,
    }),
  ]);
  return getGeneralSettings();
}

export async function getSeoSettings(): Promise<SeoSettings> {
  if (USE_MOCK) {
    await delay();
    return mockSeoSettings;
  }
  const { data } = await apiClient.get<Record<string, unknown>>(`${ADMIN}/settings/seo`);
  return {
    siteTitle: String(data.meta_title ?? ""),
    metaDescription: String(data.meta_description ?? ""),
    metaKeywords: String(data.meta_keywords ?? ""),
    canonicalUrl: "",
    ogTitle: String(data.meta_title ?? ""),
    ogDescription: String(data.meta_description ?? ""),
    ogImageUrl: String(data.og_image_url ?? ""),
    googleAnalyticsId: String(data.google_analytics_id ?? ""),
    gtmId: "",
    facebookPixelId: "",
    hreflangEn: "",
    hreflangFa: "",
  };
}

export async function updateSeoSettings(settings: Partial<SeoSettings>): Promise<SeoSettings> {
  if (USE_MOCK) {
    await delay();
    Object.assign(mockSeoSettings, settings);
    return mockSeoSettings;
  }
  await apiClient.put(`${ADMIN}/settings/seo`, {
    meta_title: settings.siteTitle,
    meta_description: settings.metaDescription,
    meta_keywords: settings.metaKeywords,
    og_image_url: settings.ogImageUrl,
    google_analytics_id: settings.googleAnalyticsId,
  });
  return getSeoSettings();
}

export async function getThemes(): Promise<Array<{ id: string; name: string; description: string }>> {
  if (USE_MOCK) {
    await delay();
    return mockThemes as Array<{ id: string; name: string; description: string }>;
  }
  const { data } = await apiClient.get<{ data: Array<Record<string, unknown>> }>(`${ADMIN}/themes`);
  return (data.data ?? []).map((theme) => ({
    id: String(theme.slug ?? theme.id ?? ""),
    name: String(theme.name ?? ""),
    description: String(theme.description ?? ""),
  }));
}

const CONTEXT_SECTION_ENDPOINTS: Record<string, string> = {
  hero: "/storefront/hero",
  "product-slides": "/storefront/product-slides",
  "pro-banners": "/storefront/pro-banners",
  brands: "/storefront/partner-brands",
  "customer-reviews": "/storefront/homepage-reviews",
  faq: "/storefront/faq",
  "contact-us": "/storefront/contact-section",
  navigation: "/storefront/navigation",
};

type ContextData = { data: unknown };

function mapContextResponse(section: string, raw: unknown): ContextData {
  const value = (raw ?? {}) as Record<string, unknown>;

  switch (section) {
    case "hero":
      return {
        data: {
          headline: String(value.title ?? ""),
          subtitle: String(value.subtitle ?? ""),
          ctaText: String(value.cta_primary_text ?? ""),
          ctaLink: String(value.cta_primary_url ?? ""),
          backgroundImage: String(value.video_url ?? ""),
          overlayOpacity: Boolean(value.is_active ?? true),
        },
      };
    case "navigation":
      return {
        data: Array.isArray(value.items)
          ? (value.items as Array<Record<string, unknown>>).map((item, idx) => ({
              id: String(item.id ?? `${idx}`),
              label: String(item.label ?? ""),
              url: String(item.url ?? ""),
              order: Number(item.sort_order ?? idx),
            }))
          : [],
      };
    case "brands":
      return {
        data: Array.isArray(value.data)
          ? (value.data as Array<Record<string, unknown>>).map((b, idx) => ({
              id: String(b.id ?? `${idx}`),
              title: String(b.title ?? ""),
              description: String(b.description ?? ""),
              logo: String(b.logo_url ?? ""),
            }))
          : [],
      };
    case "pro-banners":
      return {
        data: Array.isArray(value.data)
          ? (value.data as Array<Record<string, unknown>>).map((b, idx) => ({
              id: String(b.id ?? `${idx}`),
              link: String(b.link_url ?? ""),
              desktopImage: String(b.desktop_image_url ?? ""),
              mobileImage: String(b.mobile_image_url ?? ""),
            }))
          : [],
      };
    case "customer-reviews":
      return {
        data: Array.isArray(value.data)
          ? (value.data as Array<Record<string, unknown>>).map((r, idx) => ({
              id: String(r.id ?? `${idx}`),
              name: String(r.customer_name ?? ""),
              job: "",
              date: String(r.created_at ?? ""),
              text: String(r.review_text ?? ""),
              status: (r.is_active ? "approved" : "rejected") as "approved" | "rejected",
            }))
          : [],
      };
    case "faq":
      return {
        data: Array.isArray(value.data)
          ? (value.data as Array<Record<string, unknown>>).map((f, idx) => ({
              id: String(f.id ?? `${idx}`),
              question: String(f.question ?? ""),
              answer: String(f.answer ?? ""),
            }))
          : [],
      };
    case "contact-us":
      return {
        data: {
          heading: "",
          body: "",
          showNameField: true,
          showEmailField: true,
          showPhoneField: true,
          showSubjectField: true,
          showMessageField: true,
          imageUrl: String(value.image_url ?? ""),
        },
      };
    case "product-slides": {
      const slides = Array.isArray(value.data) ? (value.data as Array<Record<string, unknown>>) : [];
      const byType: Record<string, Record<string, unknown>> = Object.fromEntries(
        slides.map((s) => [String(s.slide_type ?? ""), s]),
      );
      const normalize = (type: string) => ({
        title: String(byType[type]?.title ?? ""),
        autoplayInterval: Number(byType[type]?.autoplay_interval_ms ?? 4500),
        productIds: Array.isArray(byType[type]?.items)
          ? ((byType[type]?.items as Array<Record<string, unknown>>).map((i) => String(i.product_id ?? "")))
          : [],
      });
      return {
        data: {
          newest: normalize("featured"),
          bestsellers: normalize("bestseller"),
          discounted: normalize("discounted"),
        },
      };
    }
    default:
      return { data: raw };
  }
}

async function persistContextSection(section: string, payload: unknown): Promise<unknown> {
  if (section === "hero") {
    const p = payload as Record<string, unknown>;
    const body = {
      title: p.headline,
      subtitle: p.subtitle,
      cta_primary_text: p.ctaText,
      cta_primary_url: p.ctaLink,
      video_url: p.backgroundImage,
      is_active: Boolean(p.overlayOpacity),
    };
    const { data } = await apiClient.put(`${ADMIN}/storefront/hero`, body);
    return data;
  }

  if (section === "navigation") {
    const items = (payload as Array<Record<string, unknown>>).map((item, idx) => ({
      id: String(item.id ?? `${idx}`),
      label: String(item.label ?? ""),
      url: String(item.url ?? ""),
      sort_order: Number(item.order ?? idx),
      is_active: true,
    }));
    const { data } = await apiClient.put(`${ADMIN}/storefront/navigation`, { items });
    return data;
  }

  if (section === "contact-us") {
    const p = payload as Record<string, unknown>;
    const { data } = await apiClient.put(`${ADMIN}/storefront/contact-section`, {
      image_url: String(p.imageUrl ?? ""),
    });
    return data;
  }

  if (section === "faq") {
    const items = Array.isArray(payload) ? (payload as Array<Record<string, unknown>>) : [];
    for (let i = 0; i < items.length; i += 1) {
      const body = {
        question: String(items[i].question ?? ""),
        answer: String(items[i].answer ?? ""),
        is_active: true,
        sort_order: i,
      };
      await apiClient.post(`${ADMIN}/storefront/faq/items`, body);
    }
    const { data } = await apiClient.get(`${ADMIN}/storefront/faq/items`);
    return data;
  }

  if (section === "product-slides") {
    const p = payload as Record<string, Record<string, unknown>>;
    const mapType: Record<string, string> = {
      newest: "featured",
      bestsellers: "bestseller",
      discounted: "discounted",
    };
    for (const key of Object.keys(mapType)) {
      const type = mapType[key];
      const item = p[key] ?? {};
      await apiClient.put(`${ADMIN}/storefront/product-slides/${type}`, {
        title: String(item.title ?? ""),
        autoplay_interval_ms: Number(item.autoplayInterval ?? 4500),
        is_active: true,
      });
    }
    const { data } = await apiClient.get(`${ADMIN}/storefront/product-slides`);
    return data;
  }

  const endpoint = CONTEXT_SECTION_ENDPOINTS[section];
  if (!endpoint) return payload;
  const { data } = await apiClient.put(`${ADMIN}${endpoint}`, payload);
  return data;
}

export async function getContextSection(section: string) {
  if (USE_MOCK) {
    await delay();
    return getMockContextSection(section);
  }
  const endpoint = CONTEXT_SECTION_ENDPOINTS[section];
  if (!endpoint) return { data: null };
  const { data } = await apiClient.get(`${ADMIN}${endpoint}`);
  return mapContextResponse(section, data);
}

export async function updateContextSection(section: string, payload: unknown) {
  if (USE_MOCK) {
    await delay();
    return setMockContextSection(section, payload);
  }
  const endpoint = CONTEXT_SECTION_ENDPOINTS[section];
  if (!endpoint) return { data: payload };
  const data = await persistContextSection(section, payload);
  return mapContextResponse(section, data);
}

export async function getStoreStyle() {
  if (USE_MOCK) {
    await delay();
    return getMockStoreStyle();
  }
  const { data } = await apiClient.get<Record<string, unknown>>(`${ADMIN}/store-style`);
  const colors = (data.colors ?? {}) as Record<string, unknown>;
  return {
    primaryColor: String(colors.primary ?? "#465fff"),
    fontFamily: String(data.font_family ?? "Inter"),
  };
}

export async function updateStoreStyle(payload: unknown) {
  if (USE_MOCK) {
    await delay();
    return setMockStoreStyle(payload as Record<string, unknown>);
  }
  const p = payload as Record<string, unknown>;
  const { data } = await apiClient.put(`${ADMIN}/store-style`, {
    font_family: String(p.fontFamily ?? "Inter"),
    colors: { primary: String(p.primaryColor ?? "#465fff") },
  });
  const colors = ((data as Record<string, unknown>).colors ?? {}) as Record<string, unknown>;
  return {
    primaryColor: String(colors.primary ?? "#465fff"),
    fontFamily: String((data as Record<string, unknown>).font_family ?? "Inter"),
  };
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  if (USE_MOCK) {
    await delay(800);
    return { url: URL.createObjectURL(file) };
  }
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ url: string }>(`${ADMIN}/uploads`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

function notificationHrefFromType(
  type: string,
  payload?: Record<string, unknown> | null,
): string {
  const id = payload?.order_id ?? payload?.product_id ?? payload?.id;
  switch (type) {
    case "order":
      return id ? `/orders/${String(id)}` : "/orders";
    case "review":
      return "/products/comments";
    case "comment":
      return "/weblog/comments";
    case "contact":
      return "/contact";
    case "stock":
      return "/products";
    case "user":
      return id ? `/users/${String(id)}` : "/users";
    default:
      return "/";
  }
}

function mapNotification(item: Record<string, unknown>): AdminNotification {
  const type = String(item.type ?? "order") as AdminNotification["type"];
  const payload =
    item.payload && typeof item.payload === "object"
      ? (item.payload as Record<string, unknown>)
      : null;
  const hrefFromApi = item.href ? String(item.href) : "";

  return {
    id: String(item.id ?? ""),
    type,
    title: item.title ? String(item.title) : undefined,
    body: item.body ? String(item.body) : undefined,
    titleKey: item.title_key ? String(item.title_key) : undefined,
    descriptionKey: item.description_key ? String(item.description_key) : undefined,
    titleParams: (item.title_params as Record<string, string | number> | undefined) ?? undefined,
    href: hrefFromApi || notificationHrefFromType(type, payload),
    read: Boolean(item.read ?? item.is_read ?? false),
    createdAt: String(item.created_at ?? new Date().toISOString()),
  };
}

export async function getNotifications(): Promise<AdminNotification[]> {
  if (USE_MOCK) {
    await delay(150);
    return [...mockNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  try {
    const { data } = await apiClient.get<ApiListResponse<Record<string, unknown>>>(
      `${ADMIN}/notifications`,
      { params: { per_page: 20, read: "all" } },
    );
    return (data.data ?? [])
      .map(mapNotification)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [...mockNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}

export async function getNotificationStats(): Promise<{
  unreadCount: number;
  totalCount: number;
}> {
  if (USE_MOCK) {
    await delay(80);
    const unreadCount = mockNotifications.filter((n) => !n.read).length;
    return { unreadCount, totalCount: mockNotifications.length };
  }
  try {
    const { data } = await apiClient.get<{ unread_count?: number; total_count?: number }>(
      `${ADMIN}/notifications/stats`,
    );
    return {
      unreadCount: Number(data.unread_count ?? 0),
      totalCount: Number(data.total_count ?? 0),
    };
  } catch {
    const list = await getNotifications();
    return {
      unreadCount: list.filter((n) => !n.read).length,
      totalCount: list.length,
    };
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(80);
    const item = mockNotifications.find((n) => n.id === id);
    if (item) item.read = true;
    return;
  }
  try {
    await apiClient.patch(`${ADMIN}/notifications/${id}/read`);
  } catch {
    /* no-op when endpoint is unavailable */
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  if (USE_MOCK) {
    await delay(80);
    mockNotifications.forEach((n) => {
      n.read = true;
    });
    return;
  }
  try {
    await apiClient.patch(`${ADMIN}/notifications/read-all`);
  } catch {
    /* no-op when endpoint is unavailable */
  }
}
