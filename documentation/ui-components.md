# UI Component Documentation

## Layout Components

### `AppLayout`
Full dashboard shell: collapsible sidebar (290px / 90px), header, auth guard, mobile drawer.

### `AuthLayout`
Centered card layout for authentication pages with title, subtitle, and branding.

### `Sidebar`
Renders navigation from `src/config/navigation.ts`. Supports nested groups with expand/collapse.

### `Header`
Search input, language switcher (EN/FA), theme toggle, notifications dropdown, user menu with sign out.

## Shared Components

### `PageHeader`
Page title, optional description, optional action slot (e.g. Add button).

### `StatCard`
KPI card with value and optional trend percentage.

### `StatusBadge`
Color-coded badge mapped to entity status (orders, products, coupons, posts).

### `DataTable`
TanStack Table wrapper with sorting, filtering, pagination, loading skeleton, empty state.

### `FileDropzone`
react-dropzone wrapper for image/file uploads (products, SEO, settings).

### `RichTextEditor`
TipTap editor for blog post content (headings, bold, lists, links, images).

### `PageTransition`
Framer Motion fade-in wrapper for page content.

### `SalesChart`
Recharts dual-bar chart for dashboard sales/revenue.

## UI Primitives (`src/components/ui/`)

| Component | Usage |
|-----------|-------|
| `Button` | Actions, form submit, icon buttons |
| `Input`, `Textarea`, `Label` | Form fields |
| `Select` | Dropdowns (status, category, filters) |
| `Checkbox`, `Switch` | Toggles, remember me |
| `Card` | Content sections |
| `Dialog`, `AlertDialog` | Modals, delete confirmation |
| `Sheet` | Mobile sidebar drawer |
| `Tabs` | Chart period, product slides |
| `DropdownMenu` | Header menus |
| `Badge` | Status chips |
| `Skeleton` | Loading placeholders |
| `Avatar` | User profile |

## Theming

Components use CSS variables defined in `globals.css`:
- `--primary: #465fff` (brand blue)
- Full light/dark token set via next-themes

Use logical properties for RTL: `ms-`, `me-`, `start`, `end`, `text-start`.
