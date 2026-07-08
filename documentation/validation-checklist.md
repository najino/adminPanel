# Final Validation Checklist

Use this checklist before considering the project complete.

## Routes

- [x] `/` — Dashboard
- [x] `/signin`, `/signup`, `/reset-password`
- [x] `/products`, `/products/create`, `/products/settings`
- [x] `/orders`, `/orders/create`, `/orders/:id`, `/orders/:id/invoice`
- [x] `/users`, `/users/:id`
- [x] `/coupons`
- [x] `/context` + 8 sub-pages
- [x] `/weblog`, `/weblog/create`, `/weblog/settings`, `/weblog/comments`
- [x] `/themes`, `/set-style`, `/setting-seo`, `/general-setting`, `/contact`
- [x] `/checkout/themes/bold-dark`, `minimal-light`, `modern-blue`
- [x] 404 page

## Features

- [x] EN + FA translations with RTL/LTR
- [x] Light / dark / system theme
- [x] Responsive sidebar (desktop + mobile drawer)
- [x] Auth flow (sign in, sign out, protected routes)
- [x] TanStack Query data fetching
- [x] React Hook Form + Zod validation
- [x] OpenAPI contract + generated types
- [x] Mock data mode for development
- [x] API client with Bearer auth + refresh interceptor

## Documentation

- [x] architecture.md
- [x] folder-structure.md
- [x] ui-components.md
- [x] api-integration.md
- [x] environment-variables.md
- [x] routing.md
- [x] state-management.md
- [x] theme-system.md
- [x] internationalization.md
- [x] deployment.md

## Backend Integration (when spec provided)

- [ ] Replace `openapi/openapi.yaml` with production spec
- [ ] Run `npm run generate:api`
- [ ] Set `NEXT_PUBLIC_USE_MOCK=false`
- [ ] Verify all endpoints match UI field names
- [ ] Test auth refresh flow against real backend

## Build Verification

Run locally (outside Cursor sandbox if SWC crashes):

```bash
npm install
npm run build
npm start
```

TypeScript check: `npx tsc --noEmit` ✅ passes
