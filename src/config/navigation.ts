export interface NavItem {
  nameKey: string;
  href?: string;
  children?: NavItem[];
}

export const navigationConfig: NavItem[] = [
  { nameKey: "dashboard", href: "/" },
  {
    nameKey: "products",
    children: [
      { nameKey: "allProducts", href: "/products" },
      { nameKey: "productAttributes", href: "/products/attributes" },
      { nameKey: "productBrands", href: "/products/brands" },
      { nameKey: "productSettings", href: "/products/settings" },
      { nameKey: "addProduct", href: "/products/create" },
    ],
  },
  {
    nameKey: "orders",
    children: [{ nameKey: "allOrders", href: "/orders" }],
  },
  {
    nameKey: "users",
    children: [{ nameKey: "allUsers", href: "/users" }],
  },
  { nameKey: "coupons", href: "/coupons" },
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
  {
    nameKey: "weblog",
    children: [
      { nameKey: "allPosts", href: "/weblog" },
      { nameKey: "addPost", href: "/weblog/create" },
      { nameKey: "postCategories", href: "/weblog/settings" },
      { nameKey: "comments", href: "/weblog/comments" },
    ],
  },
  { nameKey: "themes", href: "/themes" },
  { nameKey: "setStyle", href: "/set-style" },
  { nameKey: "seo", href: "/setting-seo" },
  {
    nameKey: "generalSetting",
    children: [{ nameKey: "baseInformation", href: "/general-setting" }],
  },
  { nameKey: "contactComments", href: "/contact" },
];

export const authRoutes = ["/signin", "/signup", "/reset-password"];

export const publicRoutes = [...authRoutes, "/checkout/themes/bold-dark", "/checkout/themes/minimal-light", "/checkout/themes/modern-blue"];
