# Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes (for live API) | Backend API base URL, e.g. `http://localhost:3001/api` |
| `NEXT_PUBLIC_APP_NAME` | No | Display name, default: `Commerce Platform` |
| `NEXT_PUBLIC_USE_MOCK` | No | **`true` by default** — all data uses in-memory mocks. Set to `false` to call the real API. |

## Example

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourbackend.com/api
NEXT_PUBLIC_APP_NAME=Commerce Platform
NEXT_PUBLIC_USE_MOCK=false
```

## Auth Storage (Client)

When connected to a real backend, tokens are stored in `localStorage`:
- `accessToken` — Bearer JWT for API requests
- `refreshToken` — Used by Axios interceptor on 401
- `authUser` — Serialized user object

## OpenAPI Code Generation

After updating `openapi/openapi.yaml`:

```bash
npm run generate:api
```

This regenerates `src/api/generated/schema.ts`.
