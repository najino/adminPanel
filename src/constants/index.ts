import type { ProductStatus, OrderStatus, CustomerStatus, CouponStatus, PostStatus } from "@/types";

export const PRODUCT_STATUSES: ProductStatus[] = [
  "active",
  "inactive",
  "lowStock",
  "outOfStock",
];

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const CUSTOMER_STATUSES: CustomerStatus[] = ["active", "inactive", "VIP"];

export const COUPON_STATUSES: CouponStatus[] = ["active", "expired", "scheduled"];

export const POST_STATUSES: PostStatus[] = ["Draft", "Published", "Scheduled"];

export const DISCOUNT_TYPES = ["percent", "fixed"] as const;

export const CHART_PERIODS = ["monthly", "quarterly", "annually"] as const;

export const CHECKOUT_THEMES = ["bold-dark", "minimal-light", "modern-blue"] as const;

export const CONTEXT_SECTIONS = [
  "hero",
  "product-slides",
  "pro-banners",
  "brands",
  "customer-reviews",
  "faq",
  "contact-us",
  "navigation",
] as const;

export const TOKEN_KEY = "accessToken";
export const REFRESH_KEY = "refreshToken";
export const AUTH_USER_KEY = "authUser";
