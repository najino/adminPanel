# Routing Structure

All routes preserve exact paths from the original shop-panel-react app. Locale is handled via cookie (`NEXT_LOCALE`) without URL prefix.

## Auth Routes

| Path | Page |
|------|------|
| `/signin` | Sign In |
| `/signup` | Create Account |
| `/reset-password` | Reset Password |

## Dashboard Routes

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/products` | All Products |
| `/products/create` | Add Product |
| `/products/settings` | Product Settings |
| `/orders` | All Orders |
| `/orders/create` | Create Order (hidden from sidebar) |
| `/orders/:id` | Order Details |
| `/orders/:id/invoice` | Invoice (print view) |
| `/users` | All Customers |
| `/users/:id` | Customer Details |
| `/coupons` | Discounts |

## Context CMS

| Path | Page |
|------|------|
| `/context` | Overview |
| `/context/hero` | Hero Settings |
| `/context/product-slides` | Product Slides |
| `/context/pro-banners` | Pro Banners |
| `/context/brands` | Partner Brands |
| `/context/customer-reviews` | Customer Reviews |
| `/context/faq` | FAQ |
| `/context/contact-us` | Contact Us Section |
| `/context/navigation` | Navigation |

## Weblog

| Path | Page |
|------|------|
| `/weblog` | All Posts |
| `/weblog/create` | Create Blog Post |
| `/weblog/settings` | Post Categories |
| `/weblog/comments` | Comments |

## Settings & Themes

| Path | Page |
|------|------|
| `/themes` | Explore Themes |
| `/set-style` | Set Style |
| `/setting-seo` | SEO Settings |
| `/general-setting` | Store Settings |
| `/contact` | Contact Messages |

## Checkout Previews

| Path | Theme |
|------|-------|
| `/checkout/themes/bold-dark` | Bold Dark |
| `/checkout/themes/minimal-light` | Minimal Light |
| `/checkout/themes/modern-blue` | Modern Blue |

## Middleware

`src/middleware.ts` runs next-intl locale detection and passes through to client-side auth guard for protected routes.
