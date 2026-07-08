export type ProductStatus = "active" | "inactive" | "lowStock" | "outOfStock";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type CustomerStatus = "active" | "inactive" | "VIP";
export type CouponStatus = "active" | "expired" | "scheduled";
export type DiscountType = "percent" | "fixed";
export type PostStatus = "Draft" | "Published" | "Scheduled";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface ProductAttribute {
  key: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  category: string;
  tags: string[];
  brand: string;
  status: ProductStatus;
  stock: number;
  images: string[];
  attributes: ProductAttribute[];
  variants?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variant: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  products: string[];
  items?: OrderItem[];
  date: string;
  amount: number;
  status: OrderStatus;
  paymentMethod?: string;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  timeline?: { status: OrderStatus; date: string }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  status: CustomerStatus;
  address?: string;
  city?: string;
  country?: string;
}

export interface Coupon {
  id: string;
  couponCode: string;
  discountType: DiscountType;
  discountValue: number;
  expiryDate: string;
  minOrder: number;
  usageLimit: number;
  usage: number;
  status: CouponStatus;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueTrend: number;
  ordersTrend: number;
  customersTrend: number;
  productsTrend: number;
  pendingTrend: number;
  lowStockTrend: number;
}

export interface ChartDataPoint {
  month: string;
  sales: number;
  revenue: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  status: PostStatus;
  publishedDate: string;
  tags: string[];
  content?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogComment {
  id: string;
  postTitle: string;
  author: string;
  content: string;
  status: "approved" | "rejected" | "pending";
  read: boolean;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  replies?: number;
}

export interface GeneralSettings {
  storeName: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  contactPhone: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface SeoSettings {
  siteTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  googleAnalyticsId: string;
  gtmId: string;
  facebookPixelId: string;
  hreflangEn: string;
  hreflangFa: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}
