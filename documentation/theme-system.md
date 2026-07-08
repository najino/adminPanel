# Theme System

## Implementation

- **Library**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Strategy**: `class="dark"` on `<html>` element
- **Default**: System preference
- **Persistence**: localStorage key `theme`

## Usage

Theme toggle in header switches between light and dark. System theme is supported via `enableSystem`.

## CSS Variables

Defined in `src/app/globals.css`:

```css
:root {
  --primary: #465fff;
  --background: ...;
  --foreground: ...;
  /* full token set */
}

.dark {
  /* dark mode overrides */
}
```

Tailwind v4 `@theme inline` maps these to utility classes (`bg-background`, `text-primary`, etc.).

## Hydration

`suppressHydrationWarning` is set on `<html>` to prevent flash from theme/locale detection.

## Brand Color

Primary brand color `#465fff` (TailAdmin blue) is preserved with improved dark mode contrast.

## Component Guidelines

- Use semantic tokens: `bg-card`, `text-muted-foreground`, `border-border`
- Avoid hardcoded colors except chart series
- Status badges use variant mapping in `StatusBadge` component
