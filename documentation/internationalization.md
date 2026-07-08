# Internationalization

## Setup

- **Library**: [next-intl](https://next-intl-docs.vercel.app/)
- **Locales**: `en` (English), `fa` (Persian/Farsi)
- **Default**: `en`
- **URL strategy**: `localePrefix: "never"` — URLs stay `/products`, locale stored in cookie

## Message Files

```
src/i18n/messages/
├── en.json
└── fa.json
```

## Namespaces

| Namespace | Content |
|-----------|---------|
| `auth` | Sign in, sign up, reset password |
| `common` | Shared actions, status labels, table headers |
| `navigation` | Sidebar menu items |
| `home` | Dashboard KPIs, charts, widgets |
| `products` | Product pages |
| `orders` | Order pages |
| `users` | Customer pages |
| `coupons` | Discount pages |
| `context` | Context CMS |
| `posts` | Weblog |
| `generalSetting` | Store settings |
| `pages` | Page titles and SEO fields |
| `contact` | Contact messages |
| `errors` | Error pages |

## RTL Support

When locale is `fa`:
- `<html dir="rtl">` is set in locale layout
- Font switches to **Vazirmatn**
- Use logical CSS: `ms-`, `me-`, `start`, `end`, `text-start`

When locale is `en`:
- `<html dir="ltr">`
- Font: **Inter**

## Switching Language

Header language dropdown sets cookie `NEXT_LOCALE` and calls `router.refresh()`.

## Adding Translations

1. Add key to both `en.json` and `fa.json`
2. Use in component: `const t = useTranslations("namespace"); t("key")`
3. For nested keys: `t("signIn.title")`
4. For interpolation: `t("pageOf", { current: 1, total: 5 })`
