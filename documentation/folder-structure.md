# Folder Structure

```
store-front/
├── documentation/          # Project docs
├── openapi/
│   └── openapi.yaml        # API contract (replace with your backend spec)
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── client.ts       # Axios instance, auth interceptors
│   │   └── generated/
│   │       └── schema.ts   # Generated from OpenAPI (npm run generate:api)
│   ├── app/
│   │   ├── globals.css     # Tailwind v4 + theme tokens
│   │   ├── layout.tsx      # Root passthrough layout
│   │   └── [locale]/
│   │       ├── layout.tsx  # HTML shell, providers, fonts
│   │       ├── not-found.tsx
│   │       ├── (auth)/     # signin, signup, reset-password
│   │       ├── (dashboard)/ # All admin pages
│   │       └── checkout/themes/[theme]/
│   ├── components/
│   │   ├── ui/             # shadcn/Radix primitives
│   │   ├── layouts/        # Sidebar, Header, AppLayout, AuthLayout
│   │   ├── tables/         # DataTable
│   │   ├── charts/         # SalesChart
│   │   └── shared/         # PageHeader, StatCard, FileDropzone, etc.
│   ├── config/
│   │   └── navigation.ts   # Sidebar tree + auth routes
│   ├── constants/
│   │   └── index.ts        # Status enums, storage keys
│   ├── hooks/              # Custom hooks (extend as needed)
│   ├── i18n/
│   │   ├── messages/       # en.json, fa.json
│   │   ├── routing.ts
│   │   └── request.ts
│   ├── lib/
│   │   ├── mock-data.ts    # Demo fixtures (matches original app)
│   │   └── utils.ts
│   ├── providers/          # Query, Theme, Auth
│   ├── services/           # auth.service, data.service
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts       # next-intl + route handling
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```
