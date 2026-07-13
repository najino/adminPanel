# Commerce Platform — Admin Panel

Production-ready Next.js admin panel rebuilt from [shop-panel-react.vercel.app](https://shop-panel-react.vercel.app/). Preserves all routes, fields, and workflows with modern UI/UX.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4** + shadcn/ui + Radix UI
- **TanStack Query** + Axios
- **React Hook Form** + Zod
- **next-intl** (EN/FA, RTL)
- **next-themes** (light/dark/system)
- **Framer Motion**, Recharts, TipTap

## Troubleshooting: Bus error on `npm run dev`

Some Linux setups (Manjaro, Ubuntu Unity, glibc 2.42+, Cursor AppImage) crash the native Next.js SWC binary. This project works around it automatically:

- `NEXT_DISABLE_SWC_BINARY=1` — forces WebAssembly SWC
- `LD_PRELOAD=` — clears injected libs that conflict with native binaries
- `@next/swc-wasm-nodejs@15.5.20` — pinned to match Next.js version

If you still see a bus error, run manually:

```bash
npm install @next/swc-wasm-nodejs@15.5.20
rm -rf node_modules/@next/swc-linux-x64-gnu node_modules/@next/swc-linux-x64-musl
npm run dev
```

First startup may take ~30s while WASM SWC downloads.


```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Mock data is enabled by default — sign in with any email/password (min 6 chars).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run generate:api` | Generate types from OpenAPI spec |

## Connecting Your Backend

1. Replace `openapi/openapi.yaml` with your backend spec
2. Run `npm run generate:api`
3. Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_USE_MOCK=false` in `.env.local`

See [documentation/api-integration.md](documentation/api-integration.md) for the endpoint mapping matrix.

## Documentation

- [Architecture](documentation/architecture.md)
- [Folder Structure](documentation/folder-structure.md)
- [UI Components](documentation/ui-components.md)
- [API Integration](documentation/api-integration.md)
- [Environment Variables](documentation/environment-variables.md)
- [Routing](documentation/routing.md)
- [State Management](documentation/state-management.md)
- [Theme System](documentation/theme-system.md)
- [Internationalization](documentation/internationalization.md)
- [Deployment](documentation/deployment.md)

## Features

- 30+ routes matching the original admin panel
- Bilingual EN/FA with RTL support
- Dark/light/system themes
- Responsive sidebar (desktop collapse + mobile drawer)
- Full CRUD for products, orders, users, coupons, blog, context CMS
- OpenAPI-driven API layer with mock mode for development
