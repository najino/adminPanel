export interface NavItem {
  nameKey: string;
  href?: string;
  children?: NavItem[];
}

export interface NavGroup {
  labelKey?: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    items: [{ nameKey: "dashboard", href: "/" }],
  },
  {
    labelKey: "sectionCommerce",
    items: [
      {
        nameKey: "orders",
        children: [{ nameKey: "allOrders", href: "/orders" }],
      },
      {
        nameKey: "products",
        children: [
          { nameKey: "allProducts", href: "/products" },
          { nameKey: "productAttributes", href: "/products/attributes" },
          { nameKey: "productBrands", href: "/products/brands" },
          { nameKey: "comments", href: "/products/comments" },
          { nameKey: "productSettings", href: "/products/settings" },
          { nameKey: "addProduct", href: "/products/create" },
        ],
      },
      {
        nameKey: "users",
        children: [{ nameKey: "allUsers", href: "/users" }],
      },
    ],
  },
  {
    labelKey: "sectionMarketing",
    items: [
      { nameKey: "coupons", href: "/coupons" },
      {
        nameKey: "weblog",
        children: [
          { nameKey: "allPosts", href: "/weblog" },
          { nameKey: "addPost", href: "/weblog/create" },
          { nameKey: "postCategories", href: "/weblog/settings" },
          { nameKey: "comments", href: "/weblog/comments" },
        ],
      },
    ],
  },
  {
    labelKey: "sectionContent",
    items: [
      {
        nameKey: "context",
        children: [
          { nameKey: "contextOverview", href: "/context" },
          { nameKey: "hero", href: "/context/hero" },
          { nameKey: "productSlides", href: "/context/product-slides" },
          { nameKey: "proBanners", href: "/context/pro-banners" },
          { nameKey: "brands", href: "/context/brands" },
          { nameKey: "customerReviews", href: "/context/customer-reviews" },
          { nameKey: "faq", href: "/context/faq" },
          { nameKey: "contextContactUs", href: "/context/contact-us" },
          { nameKey: "navigation", href: "/context/navigation" },
        ],
      },
      { nameKey: "themes", href: "/themes" },
      { nameKey: "setStyle", href: "/set-style" },
    ],
  },
  {
    labelKey: "sectionSystem",
    items: [
      { nameKey: "seo", href: "/setting-seo" },
      {
        nameKey: "generalSetting",
        children: [{ nameKey: "baseInformation", href: "/general-setting" }],
      },
      { nameKey: "contactComments", href: "/contact" },
    ],
  },
];

/** Flat list for backward compatibility */
export const navigationConfig: NavItem[] = navigationGroups.flatMap((g) => g.items);

export const authRoutes = ["/signin", "/signup", "/reset-password"];

export const publicRoutes = [
  ...authRoutes,
  "/checkout/themes/bold-dark",
  "/checkout/themes/minimal-light",
  "/checkout/themes/modern-blue",
];
