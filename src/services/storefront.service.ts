import { apiClient } from "@/api/client";
import { IS_MOCK_MODE } from "@/config/mock";
import type {
  ContactSection,
  FaqItem,
  FaqItemPayload,
  HeroSettings,
  HomepageReview,
  HomepageReviewPayload,
  NavItem,
  PartnerBrand,
  PartnerBrandPayload,
  ProBanner,
  ProBannerPayload,
  ProductSlide,
  ProductSlidePayload,
  SlideItem,
  SlideItemPayload,
  SlideType,
} from "@/types/api/storefront";

const USE_MOCK = IS_MOCK_MODE;
const SF = "/admin/storefront";

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

function list<T>(data: { data?: T[] } | T[]): T[] {
  if (Array.isArray(data)) return data;
  return data.data ?? [];
}

const mockReviews: HomepageReview[] = [
  {
    id: "review-1",
    customer_name: "Sarah Johnson",
    review_text: "Amazing products and fast delivery!",
    rating: 5,
    is_active: true,
    created_at: "2026-01-15T10:00:00.000Z",
  },
];

const mockPartnerBrands: PartnerBrand[] = [];
const mockProBanners: ProBanner[] = [];
const mockFaqItems: FaqItem[] = [];
let mockHero: HeroSettings = { is_active: true };
let mockContact: ContactSection = {};
let mockNavigation: NavItem[] = [];
const mockSlides: ProductSlide[] = [
  { id: "slide-featured", slide_type: "featured", title: "", autoplay_interval_ms: 4500, items: [] },
  { id: "slide-bestseller", slide_type: "bestseller", title: "", autoplay_interval_ms: 4500, items: [] },
  { id: "slide-discounted", slide_type: "discounted", title: "", autoplay_interval_ms: 4500, items: [] },
];

export function isTemporaryId(id: string): boolean {
  return /^\d{10,}$/.test(id);
}

// --- Hero ---
export async function getHero(): Promise<HeroSettings> {
  if (USE_MOCK) {
    await delay();
    return { ...mockHero };
  }
  const { data } = await apiClient.get<HeroSettings>(`${SF}/hero`);
  return data;
}

export async function updateHero(payload: HeroSettings): Promise<HeroSettings> {
  if (USE_MOCK) {
    await delay();
    mockHero = { ...mockHero, ...payload };
    return mockHero;
  }
  const { data } = await apiClient.put<HeroSettings>(`${SF}/hero`, payload);
  return data;
}

// --- Contact section ---
export async function getContactSection(): Promise<ContactSection> {
  if (USE_MOCK) {
    await delay();
    return { ...mockContact };
  }
  const { data } = await apiClient.get<ContactSection>(`${SF}/contact-section`);
  return data;
}

export async function updateContactSection(payload: ContactSection): Promise<ContactSection> {
  if (USE_MOCK) {
    await delay();
    mockContact = { ...mockContact, ...payload };
    return mockContact;
  }
  const { data } = await apiClient.put<ContactSection>(`${SF}/contact-section`, payload);
  return data;
}

// --- Navigation ---
export async function getNavigation(): Promise<NavItem[]> {
  if (USE_MOCK) {
    await delay();
    return [...mockNavigation];
  }
  const { data } = await apiClient.get<{ items?: NavItem[] }>(`${SF}/navigation`);
  return data.items ?? [];
}

export async function updateNavigation(items: NavItem[]): Promise<NavItem[]> {
  if (USE_MOCK) {
    await delay();
    mockNavigation = items.map((item, idx) => ({
      ...item,
      sort_order: item.sort_order ?? idx,
      is_active: item.is_active ?? true,
    }));
    return [...mockNavigation];
  }
  const body = {
    items: items.map((item, idx) => ({
      ...(item.id && !isTemporaryId(item.id) ? { id: item.id } : {}),
      label: item.label,
      url: item.url,
      sort_order: item.sort_order ?? idx,
      is_active: item.is_active ?? true,
    })),
  };
  const { data } = await apiClient.put<{ items?: NavItem[] }>(`${SF}/navigation`, body);
  return data.items ?? [];
}

// --- Homepage reviews ---
export async function getHomepageReviews(): Promise<HomepageReview[]> {
  if (USE_MOCK) {
    await delay();
    return [...mockReviews];
  }
  const { data } = await apiClient.get<{ data: HomepageReview[] }>(`${SF}/homepage-reviews`);
  return list(data);
}

export async function createHomepageReview(payload: HomepageReviewPayload): Promise<HomepageReview> {
  if (USE_MOCK) {
    await delay();
    const review: HomepageReview = { id: `review-${Date.now()}`, ...payload, created_at: new Date().toISOString() };
    mockReviews.push(review);
    return review;
  }
  const { data } = await apiClient.post<HomepageReview>(`${SF}/homepage-reviews`, payload);
  return data;
}

export async function updateHomepageReview(id: string, payload: HomepageReviewPayload): Promise<HomepageReview> {
  if (USE_MOCK) {
    await delay();
    const idx = mockReviews.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Review not found");
    mockReviews[idx] = { ...mockReviews[idx], ...payload };
    return mockReviews[idx];
  }
  const { data } = await apiClient.put<HomepageReview>(`${SF}/homepage-reviews/${id}`, payload);
  return data;
}

export async function deleteHomepageReview(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockReviews.findIndex((r) => r.id === id);
    if (idx !== -1) mockReviews.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${SF}/homepage-reviews/${id}`);
}

export function reviewToPayload(review: HomepageReview): HomepageReviewPayload {
  return {
    customer_name: review.customer_name,
    review_text: review.review_text,
    photo_url: review.photo_url,
    rating: review.rating,
    is_active: review.is_active,
    sort_order: review.sort_order,
  };
}

// --- Partner brands ---
export async function getPartnerBrands(): Promise<PartnerBrand[]> {
  if (USE_MOCK) {
    await delay();
    return [...mockPartnerBrands];
  }
  const { data } = await apiClient.get<{ data: PartnerBrand[] }>(`${SF}/partner-brands`);
  return list(data);
}

export async function createPartnerBrand(payload: PartnerBrandPayload): Promise<PartnerBrand> {
  if (USE_MOCK) {
    await delay();
    const brand: PartnerBrand = { id: `pb-${Date.now()}`, ...payload };
    mockPartnerBrands.push(brand);
    return brand;
  }
  const { data } = await apiClient.post<PartnerBrand>(`${SF}/partner-brands`, payload);
  return data;
}

export async function updatePartnerBrand(id: string, payload: PartnerBrandPayload): Promise<PartnerBrand> {
  if (USE_MOCK) {
    await delay();
    const idx = mockPartnerBrands.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Brand not found");
    mockPartnerBrands[idx] = { ...mockPartnerBrands[idx], ...payload };
    return mockPartnerBrands[idx];
  }
  const { data } = await apiClient.put<PartnerBrand>(`${SF}/partner-brands/${id}`, payload);
  return data;
}

export async function deletePartnerBrand(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockPartnerBrands.findIndex((b) => b.id === id);
    if (idx !== -1) mockPartnerBrands.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${SF}/partner-brands/${id}`);
}

export function partnerBrandToPayload(brand: PartnerBrand): PartnerBrandPayload {
  return {
    title: brand.title,
    logo_url: brand.logo_url ?? "",
    description: brand.description,
    link_url: brand.link_url,
    is_active: brand.is_active,
    sort_order: brand.sort_order,
  };
}

// --- Pro banners ---
export async function getProBanners(): Promise<ProBanner[]> {
  if (USE_MOCK) {
    await delay();
    return [...mockProBanners];
  }
  const { data } = await apiClient.get<{ data: ProBanner[] }>(`${SF}/pro-banners`);
  return list(data);
}

export async function createProBanner(payload: ProBannerPayload): Promise<ProBanner> {
  if (USE_MOCK) {
    await delay();
    const banner: ProBanner = { id: `banner-${Date.now()}`, ...payload };
    mockProBanners.push(banner);
    return banner;
  }
  const { data } = await apiClient.post<ProBanner>(`${SF}/pro-banners`, payload);
  return data;
}

export async function updateProBanner(id: string, payload: ProBannerPayload): Promise<ProBanner> {
  if (USE_MOCK) {
    await delay();
    const idx = mockProBanners.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Banner not found");
    mockProBanners[idx] = { ...mockProBanners[idx], ...payload };
    return mockProBanners[idx];
  }
  const { data } = await apiClient.put<ProBanner>(`${SF}/pro-banners/${id}`, payload);
  return data;
}

export async function deleteProBanner(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockProBanners.findIndex((b) => b.id === id);
    if (idx !== -1) mockProBanners.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${SF}/pro-banners/${id}`);
}

export function proBannerToPayload(banner: ProBanner): ProBannerPayload {
  return {
    desktop_image_url: banner.desktop_image_url,
    mobile_image_url: banner.mobile_image_url,
    link_url: banner.link_url,
    is_active: banner.is_active,
    sort_order: banner.sort_order,
  };
}

// --- FAQ ---
export async function getFaqItems(): Promise<FaqItem[]> {
  if (USE_MOCK) {
    await delay();
    return [...mockFaqItems];
  }
  const { data } = await apiClient.get<{ data: FaqItem[] }>(`${SF}/faq/items`);
  return list(data);
}

export async function createFaqItem(payload: FaqItemPayload): Promise<FaqItem> {
  if (USE_MOCK) {
    await delay();
    const item: FaqItem = { id: `faq-${Date.now()}`, ...payload };
    mockFaqItems.push(item);
    return item;
  }
  const { data } = await apiClient.post<FaqItem>(`${SF}/faq/items`, payload);
  return data;
}

export async function updateFaqItem(id: string, payload: FaqItemPayload): Promise<FaqItem> {
  if (USE_MOCK) {
    await delay();
    const idx = mockFaqItems.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error("FAQ item not found");
    mockFaqItems[idx] = { ...mockFaqItems[idx], ...payload };
    return mockFaqItems[idx];
  }
  const { data } = await apiClient.put<FaqItem>(`${SF}/faq/items/${id}`, payload);
  return data;
}

export async function deleteFaqItem(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const idx = mockFaqItems.findIndex((f) => f.id === id);
    if (idx !== -1) mockFaqItems.splice(idx, 1);
    return;
  }
  await apiClient.delete(`${SF}/faq/items/${id}`);
}

// --- Product slides ---
export const SLIDE_TAB_TO_TYPE = {
  newest: "featured",
  bestsellers: "bestseller",
  discounted: "discounted",
} as const;

export type SlideTab = keyof typeof SLIDE_TAB_TO_TYPE;

export type SlideTabConfig = {
  title: string;
  autoplayInterval: number;
  items: SlideItem[];
};

export async function getProductSlides(): Promise<ProductSlide[]> {
  if (USE_MOCK) {
    await delay();
    return mockSlides.map((s) => ({ ...s, items: [...(s.items ?? [])] }));
  }
  const { data } = await apiClient.get<{ data: ProductSlide[] }>(`${SF}/product-slides`);
  return list(data);
}

export async function updateProductSlide(
  slideType: SlideType,
  payload: ProductSlidePayload,
): Promise<ProductSlide> {
  if (USE_MOCK) {
    await delay();
    const idx = mockSlides.findIndex((s) => s.slide_type === slideType);
    if (idx !== -1) mockSlides[idx] = { ...mockSlides[idx], ...payload };
    return mockSlides[idx];
  }
  const { data } = await apiClient.put<ProductSlide>(`${SF}/product-slides/${slideType}`, payload);
  return data;
}

export async function addSlideItem(slideType: SlideType, payload: SlideItemPayload): Promise<SlideItem> {
  if (USE_MOCK) {
    await delay();
    const slide = mockSlides.find((s) => s.slide_type === slideType);
    const item: SlideItem = { id: `si-${Date.now()}`, ...payload };
    if (slide) slide.items = [...(slide.items ?? []), item];
    return item;
  }
  const { data } = await apiClient.post<SlideItem>(`${SF}/product-slides/${slideType}/items`, payload);
  return data;
}

export async function deleteSlideItem(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay();
    for (const slide of mockSlides) {
      slide.items = (slide.items ?? []).filter((i) => i.id !== id);
    }
    return;
  }
  await apiClient.delete(`${SF}/product-slide-items/${id}`);
}

export async function syncProductSlides(
  tabs: Record<SlideTab, SlideTabConfig>,
  serverSlides: ProductSlide[],
): Promise<void> {
  for (const [tab, config] of Object.entries(tabs) as [SlideTab, SlideTabConfig][]) {
    const slideType = SLIDE_TAB_TO_TYPE[tab];
    const serverSlide = serverSlides.find((s) => s.slide_type === slideType);
    const serverItems = serverSlide?.items ?? [];

    await updateProductSlide(slideType, {
      title: config.title,
      autoplay_interval_ms: config.autoplayInterval,
      is_active: true,
    });

    const serverProductIds = new Set(serverItems.map((i) => i.product_id));
    const localProductIds = new Set(config.items.map((i) => i.product_id));

    for (const item of serverItems) {
      if (!localProductIds.has(item.product_id)) {
        await deleteSlideItem(item.id);
      }
    }

    let order = 0;
    for (const item of config.items) {
      if (!serverProductIds.has(item.product_id)) {
        await addSlideItem(slideType, { product_id: item.product_id, sort_order: order });
      }
      order += 1;
    }
  }
}

export function slidesToTabs(slides: ProductSlide[]): Record<SlideTab, SlideTabConfig> {
  const byType = Object.fromEntries(slides.map((s) => [s.slide_type, s])) as Partial<
    Record<SlideType, ProductSlide>
  >;
  const normalize = (type: SlideType): SlideTabConfig => ({
    title: byType[type]?.title ?? "",
    autoplayInterval: byType[type]?.autoplay_interval_ms ?? 4500,
    items: byType[type]?.items ?? [],
  });
  return {
    newest: normalize("featured"),
    bestsellers: normalize("bestseller"),
    discounted: normalize("discounted"),
  };
}
