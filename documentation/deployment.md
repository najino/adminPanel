# Deployment Guide

## Vercel (Recommended)

1. Push repository to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_USE_MOCK=false` (production)
4. Deploy

Next.js App Router handles routing natively — no SPA rewrite needed (unlike the original Vite app).

## Build Commands

```bash
npm install
npm run build
npm start
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Mock data is enabled by default.

## Environment Checklist

- [ ] `NEXT_PUBLIC_API_BASE_URL` points to production API
- [ ] `NEXT_PUBLIC_USE_MOCK=false`
- [ ] OpenAPI spec updated and types regenerated
- [ ] CORS configured on backend for frontend domain
- [ ] Auth refresh endpoint accessible

## Docker (Optional)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Add `output: 'standalone'` to `next.config.ts` for standalone Docker builds.

## Post-Deploy Validation

- [ ] All 30+ routes accessible via direct URL
- [ ] EN/FA switching works
- [ ] Dark/light theme works
- [ ] Auth flow (sign in → dashboard → sign out)
- [ ] API calls reach backend (check network tab)
