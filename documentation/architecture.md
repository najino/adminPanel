# Project Architecture

## Overview

Commerce Platform is a Next.js 15 App Router admin panel rebuilt from the TailAdmin-based shop-panel-react reference. It preserves all original routes, fields, and workflows while using modern tooling and premium UI patterns.

## Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│  App Router Pages (src/app/[locale]/)                   │
├─────────────────────────────────────────────────────────┤
│  Feature Components (src/features/, page-level)         │
├─────────────────────────────────────────────────────────┤
│  Shared UI (src/components/ui, layouts, tables)       │
├─────────────────────────────────────────────────────────┤
│  TanStack Query Hooks (page-level useQuery/useMutation) │
├─────────────────────────────────────────────────────────┤
│  Services (src/services/) — domain API abstraction      │
├─────────────────────────────────────────────────────────┤
│  API Client (src/api/client.ts) — Axios + interceptors  │
├─────────────────────────────────────────────────────────┤
│  Backend API (OpenAPI contract)                         │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

- **Feature parity first**: Every route and form field from the original app is preserved.
- **Contract-driven API**: OpenAPI spec in `openapi/openapi.yaml` drives types and endpoint mapping.
- **Mock mode**: `NEXT_PUBLIC_USE_MOCK=true` (default) uses in-memory mock data until backend is wired.
- **i18n without URL prefix**: `localePrefix: "never"` keeps URLs identical to the original (`/products`, not `/en/products`).
- **Client-side auth guard**: Tokens in localStorage with Axios interceptors for refresh.

## Providers

| Provider | Responsibility |
|----------|----------------|
| `ThemeProvider` | Light / dark / system via next-themes |
| `QueryProvider` | TanStack Query client |
| `AuthProvider` | User session state |
| `NextIntlClientProvider` | Runtime translations |

## Route Groups

- `(auth)` — Sign in, sign up, reset password (no sidebar)
- `(dashboard)` — Protected admin shell with sidebar + header
- `checkout/themes/[theme]` — Public checkout theme previews
