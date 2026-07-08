# API Endpoint Mapping Matrix

Maps each UI page/field to the OpenAPI contract in `openapi/openapi.yaml`.
Replace placeholder spec with your backend spec and regenerate types: `npm run generate:api`.

| Page | UI Action | Method | Endpoint | Payload Fields |
|------|-----------|--------|----------|----------------|
| `/signin` | Sign in | POST | `/auth/signin` | email, password, rememberMe |
| `/signup` | Register | POST | `/auth/signup` | firstName, lastName, email, password |
| `/reset-password` | Reset | POST | `/auth/reset-password` | email |
| Header | Sign out | POST | `/auth/logout` | — |
| API client | Refresh token | POST | `/auth/refresh` | refreshToken |
| `/` | KPI stats | GET | `/dashboard/stats` | — |
| `/products` | List | GET | `/products` | search, category, status, page |
| `/products` | Delete | DELETE | `/products/{id}` | — |
| `/products/create` | Create | POST | `/products` | name, description, sku, price, compareAtPrice, cost, category, tags, brand, status, attributes, images |
| `/products/settings` | Categories | GET/POST | `/products/settings/categories` | name |
| `/orders` | List | GET | `/orders` | status, date, search |
| `/orders/create` | Create | POST | `/orders` | — |
| `/orders/:id` | Detail | GET | `/orders/{id}` | — |
| `/orders/:id` | Update status | PATCH | `/orders/{id}` | status |
| `/users` | List | GET | `/users` | — |
| `/users/:id` | Detail | GET | `/users/{id}` | — |
| `/coupons` | List/Create/Delete | GET/POST/DELETE | `/coupons`, `/coupons/{id}` | couponCode, discountType, discountValue, expiryDate, minOrder, usageLimit |
| `/context/*` | Get/Update | GET/PATCH | `/context/{section}` | section-specific |
| `/weblog` | Posts | GET/POST | `/posts` | title, slug, category, tags, content, featuredImage, publishDate, seo |
| `/weblog/settings` | Categories | GET | `/posts/categories` | — |
| `/weblog/comments` | Comments | GET | `/comments` | — |
| `/general-setting` | Settings | GET/PATCH | `/settings/general` | storeName, logo, favicon, contactEmail, contactPhone, socialLinks |
| `/setting-seo` | SEO | GET/PATCH | `/settings/seo` | siteTitle, metaDescription, metaKeywords, canonicalUrl, ogTitle, ogDescription, ogImageUrl, analytics IDs, hreflang |
| `/contact` | Messages | GET/DELETE | `/contact-messages`, `/contact-messages/{id}` | — |
| `/themes` | List | GET | `/themes` | — |
| `/set-style` | Style | GET/PATCH | `/store/style` | — |
| Uploads | Files | POST | `/upload` | multipart file |

## Auth Scheme

- **Type:** Bearer JWT (`Authorization: Bearer <accessToken>`)
- **Storage:** `localStorage` keys: `accessToken`, `refreshToken` (configurable in `src/api/client.ts`)
- **Refresh:** On 401, attempt `POST /auth/refresh` then retry original request

## Integration Steps

1. Replace `openapi/openapi.yaml` with your backend spec
2. Run `npm run generate:api`
3. Update service functions in `src/services/` to use generated types
4. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
