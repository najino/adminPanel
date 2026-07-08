# Design System

Modern UI/UX foundation for the Commerce Platform admin panel. Aligned with `.cursor/skills` (frontend-design, ui-ux-pro-max, shadcn styling rules).

## Design direction

**Subject:** E-commerce command center — data-dense, trustworthy, professional.

**Aesthetic:** Linear / Vercel-inspired minimal SaaS — cool neutral surfaces, refined indigo primary, subtle elevation, left-rail active navigation.

**Typography:** Inter (EN) / Vazirmatn (FA) with tabular numerals for KPIs and tables.

## Token system

All colors live in `src/app/globals.css` as CSS custom properties. Components must use semantic tokens — never raw Tailwind palette classes (`text-emerald-600`, etc.).

| Token | Usage |
|-------|--------|
| `--primary` | CTAs, active accents, brand |
| `--muted` / `--muted-foreground` | Secondary text, table headers |
| `--success` / `--success-muted` | Positive trends, delivered status |
| `--warning` / `--warning-muted` | Low stock, pending states |
| `--info` / `--info-muted` | Processing, informational badges |
| `--destructive` | Errors, cancelled orders |
| `--sidebar-*` | Navigation shell |
| `--chart-1/2/3` | Recharts series |
| `--shadow-sm/md/lg` | Elevation (`shadow-elevated-*`) |

## Spacing

8px grid via Tailwind scale: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px). Prefer `flex` + `gap-*` over `space-y-*`.

## Layout

- **App shell:** Sidebar (260px / 72px collapsed) + sticky header + muted content canvas
- **Auth:** Split panel on desktop — brand panel + form card
- **Content max-width:** 1600px centered in main area

## Components

| Component | Location | Notes |
|-----------|----------|-------|
| `StatCard` | `shared/page-elements.tsx` | KPI with skeleton loading, trend icons |
| `PageHeader` | `shared/page-elements.tsx` | Title, description, optional action |
| `EmptyState` | `shared/page-elements.tsx` | Icon, title, optional CTA |
| `ErrorState` | `shared/page-elements.tsx` | Destructive-tinted alert block |
| `DataTable` | `tables/data-table.tsx` | Search, pagination, empty/loading |
| `LoadingSpinner` | `shared/loading-spinner.tsx` | Accessible spinner with label |
| Navigation icons | `config/navigation-icons.ts` | Lucide map per route |

## Accessibility

- WCAG AA contrast via oklch tokens
- `aria-current="page"` on active nav links
- `role="status"` on loading spinners
- `prefers-reduced-motion` disables animations globally
- Focus rings on all interactive elements (`ring-ring`)

## Motion

- Page enter: 200ms fade + 6px translate (`PageTransition`)
- Buttons: subtle `active:scale-[0.98]`
- Cards: hover elevation on KPI stat cards
- Disabled when `prefers-reduced-motion: reduce`

## Dark mode

Full token set in `.dark` — deep neutral background (`oklch(0.13…)`) with elevated cards and adjusted semantic muted backgrounds.
