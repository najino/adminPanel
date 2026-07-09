/** Storefront admin API types — aligned with docs.json */

export type SlideType = "featured" | "bestseller" | "discounted";

export interface HomepageReview {
  id: string;
  customer_name: string;
  review_text: string;
  photo_url?: string;
  rating?: number;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface HomepageReviewPayload {
  customer_name: string;
  review_text: string;
  photo_url?: string;
  rating?: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface HeroSettings {
  title?: string;
  subtitle?: string;
  cta_primary_text?: string;
  cta_primary_url?: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
  video_url?: string;
  is_active?: boolean;
}

export interface ContactSection {
  image_url?: string;
}

export interface NavItem {
  id?: string;
  label: string;
  url: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface PartnerBrand {
  id: string;
  title: string;
  description?: string;
  logo_url?: string;
  link_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface PartnerBrandPayload {
  title: string;
  logo_url: string;
  description?: string;
  link_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ProBanner {
  id: string;
  link_url?: string;
  desktop_image_url: string;
  mobile_image_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ProBannerPayload {
  desktop_image_url: string;
  link_url?: string;
  mobile_image_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface FaqItemPayload {
  question: string;
  answer: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface SlideItem {
  id: string;
  product_id: string;
  sort_order?: number;
  tab_label?: string;
}

export interface ProductSlide {
  id: string;
  slide_type: SlideType;
  title?: string;
  autoplay_interval_ms?: number;
  is_active?: boolean;
  items?: SlideItem[];
}

export interface ProductSlidePayload {
  title?: string;
  autoplay_interval_ms?: number;
  is_active?: boolean;
}

export interface SlideItemPayload {
  product_id: string;
  sort_order?: number;
  tab_label?: string;
}
