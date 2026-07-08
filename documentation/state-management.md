# State Management

## Server State — TanStack Query

All API data is fetched via TanStack Query in page components:

| Query Key | Service Function | Used By |
|-----------|------------------|---------|
| `dashboard-stats` | `getDashboardStats` | Dashboard |
| `chart-data` | `getChartData` | Dashboard chart |
| `products` | `getProducts` | Products list, dashboard |
| `orders` | `getOrders` | Orders list, dashboard |
| `order` | `getOrder` | Order detail |
| `customers` | `getCustomers` | Users list |
| `customer` | `getCustomer` | User detail |
| `coupons` | `getCoupons` | Coupons |
| `categories` | `getCategories` | Product settings |
| `posts` | `getPosts` | Weblog |
| `comments` | `getComments` | Weblog comments |
| `contact-messages` | `getContactMessages` | Contact |
| `general-settings` | `getGeneralSettings` | General setting |
| `seo-settings` | `getSeoSettings` | SEO setting |
| `themes` | `getThemes` | Themes |

Mutations invalidate relevant query keys on success.

## Client State — Auth

`AuthProvider` (`src/providers/auth-provider.tsx`):
- `user` — Current authenticated user
- `isAuthenticated` — Boolean derived from user + token
- `setUser` — Called after sign in / sign up
- `signOut` — Clears tokens and user

## Client State — UI

- **Sidebar collapse**: Local state in `AppLayout`
- **Mobile drawer**: Sheet open state in `AppLayout`
- **Theme**: `next-themes` persisted to localStorage
- **Locale**: Cookie `NEXT_LOCALE` + next-intl middleware

## Form State

React Hook Form + Zod validation on all forms. Form state is local to each page component.
