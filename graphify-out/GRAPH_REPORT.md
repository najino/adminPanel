# Graph Report - store-front  (2026-07-07)

## Corpus Check
- 140 files · ~75,046 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1019 nodes · 2099 edges · 76 communities (69 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ca8e0a16`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 111 edges
2. `Button()` - 39 edges
3. `delay()` - 39 edges
4. `PageTransition()` - 33 edges
5. `PageHeader()` - 29 edges
6. `Input()` - 26 edges
7. `Card()` - 21 edges
8. `CardContent()` - 21 edges
9. `Label()` - 21 edges
10. `CardHeader()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `_generate_intelligent_overrides()` --calls--> `search()`  [INFERRED]
  .cursor/skills/ui-ux-pro-max/scripts/design_system.py → .cursor/skills/ui-ux-pro-max/scripts/core.py
- `UserDetailPage()` --calls--> `formatDate()`  [INFERRED]
  src/app/[locale]/(dashboard)/users/[id]/page.tsx → src/lib/utils.ts
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuRadioItem()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts
- `DropdownMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (76 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (34): createCategory(), createCoupon(), createOrder(), createPost(), createPostCategory(), createProduct(), delay(), deleteCategory() (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (42): dependencies, axios, class-variance-authority, clsx, date-fns, framer-motion, @hookform/resolvers, lucide-react (+34 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, openapi-typescript, prettier, prettier-plugin-tailwindcss, tailwindcss (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (72): Brand, BrandsPage(), FormData, schema, sections, ProductForm, productSchema, CustomerReviewsPage() (+64 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (16): cn(), defaultActions, QuickAction, QuickActions(), AlertDialogOverlay(), Avatar(), AvatarFallback(), AvatarImage() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (13): HeaderProps, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (14): CHART_PERIODS, CHECKOUT_THEMES, CONTEXT_SECTIONS, COUPON_STATUSES, CUSTOMER_STATUSES, DISCOUNT_TYPES, ORDER_STATUSES, POST_STATUSES (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (19): CouponForm, couponSchema, MenuItem, DataTable(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+11 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (32): apiClient, ApiError, clearTokens(), getAccessToken(), refreshQueue, setTokens(), AuthLayout(), highlights (+24 more)

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (7): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), sheetVariants

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (30): SalesChart(), mockCategories, mockChartData, mockComments, mockContactMessages, mockCoupons, mockCustomers, mockDashboardStats (+22 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (11): mockContextSections, mockStoreStyle, ContextStore, getMockContextSection(), getMockStoreStyle(), setMockContextSection(), setMockStoreStyle(), storeStyle (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (10): getNavIcon(), navigationIcons, NavLink(), SidebarProps, RowAction, TableRowActions(), Tooltip(), TooltipContent() (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (27): Benefits, Bootstrap 5, Breakpoint Strategies, Breakpoint Tokens, Cards Grid, Combining Feature and Size Queries, Common Breakpoint Scales, Content-Based Breakpoints (+19 more)

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (26): Auto-fit Grid, Calculating Fluid Values, Cluster Layout, Combining Viewport and Container Units, Complete Type Scale, Container Widths, Content-Based Widths, CSS Grid Fluid Layouts (+18 more)

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (4): API Endpoint Mapping Matrix, Auth Scheme, Integration Steps, Folder Structure

### Community 19 - "Community 19"
Cohesion: 0.11
Nodes (17): `AppLayout`, `AuthLayout`, `DataTable`, `FileDropzone`, `Header`, Layout Components, `PageHeader`, `PageTransition` (+9 more)

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (7): Build Commands, Deployment Guide, Development, Docker (Optional), Environment Checklist, Post-Deploy Validation, Vercel (Recommended)

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (8): Auth Routes, Checkout Previews, Context CMS, Dashboard Routes, Middleware, Routing Structure, Settings & Themes, Weblog

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (7): Brand Color, Component Guidelines, CSS Variables, Hydration, Implementation, Theme System, Usage

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (6): Key Design Decisions, Layered Architecture, Overview, Project Architecture, Providers, Route Groups

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (7): Adding Translations, Internationalization, Message Files, Namespaces, RTL Support, Setup, Switching Language

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (7): Commerce Platform — Admin Panel, Connecting Your Backend, Documentation, Features, Scripts, Stack, Troubleshooting: Bus error on `npm run dev`

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (5): Client State — Auth, Client State — UI, Form State, Server State — TanStack Query, State Management

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (5): components, $defs, operations, paths, webhooks

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (22): Browser Support, Combining Conditions, Container Queries Deep Dive, Container Query Syntax, Container Query Units, Container Types, Containment Basics, Dashboard Widget (+14 more)

### Community 33 - "Community 33"
Cohesion: 0.40
Nodes (4): Auth Storage (Client), Environment Variables, Example, OpenAPI Code Generation

### Community 36 - "Community 36"
Cohesion: 0.28
Nodes (5): AppLayout(), Header(), Sidebar(), LoadingSpinner(), Sheet()

### Community 37 - "Community 37"
Cohesion: 0.14
Nodes (12): Locale, routing, inter, vazirmatn, AuthProvider(), QueryProvider(), ThemeProvider(), config (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (6): Backend Integration (when spec provided), Build Verification, Documentation, Features, Final Validation Checklist, Routes

### Community 39 - "Community 39"
Cohesion: 0.40
Nodes (4): fs, nativePackages, nextDir, path

### Community 40 - "Community 40"
Cohesion: 0.11
Nodes (18): CLI, Component Docs, Examples, and Usage, Component Selection, Component Structure → [composition.md](./rules/composition.md), Critical Rules, Current Project Context, Detailed References, Forms & Inputs → [forms.md](./rules/forms.md) (+10 more)

### Community 41 - "Community 41"
Cohesion: 0.12
Nodes (16): 1. Container Queries, 2. Fluid Typography & Spacing, 3. Layout Patterns, 4. Breakpoint Strategy, Core Capabilities, Key Patterns, Modern Breakpoint Scale, Pattern 1: Container Queries (+8 more)

### Community 42 - "Community 42"
Cohesion: 0.17
Nodes (16): ansi_ljust(), format_ascii_box(), format_markdown(), format_master_md(), generate_design_system(), hex_to_ansi(), persist_design_system(), Convert hex color to ANSI True Color swatch (██) with fallback. (+8 more)

### Community 43 - "Community 43"
Cohesion: 0.16
Nodes (9): DesignSystemGenerator, Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation., Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Execute searches across multiple domains., Find matching reasoning rule for a category. (+1 more)

### Community 44 - "Community 44"
Cohesion: 0.12
Nodes (17): `add` — Add components, `apply` — Apply a preset to an existing project, `build` — Build a custom registry, Commands, Contents, `diff` — Check for updates, `docs` — Get component documentation URLs, Dry-Run Mode (+9 more)

### Community 45 - "Community 45"
Cohesion: 0.29
Nodes (13): blend(), derive_row(), derive_ui_reasoning(), h2r(), is_dark(), lum(), on_color(), r2h() (+5 more)

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (9): Adding Custom Colors, Border Radius, Changing the Theme, Checking for Updates, Color Variables, Contents, Customization & Theming, Dark Mode (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.15
Nodes (13): Avatar always needs AvatarFallback, Button has no isPending or isLoading prop, Callouts use Alert, Card structure, Choosing between overlay components, Component Composition, Contents, Dialog, Sheet, and Drawer always need a Title (+5 more)

### Community 49 - "Community 49"
Cohesion: 0.17
Nodes (12): Built-in variants first, className for layout only, Contents, No manual dark: color overrides, No manual z-index on overlay components, No raw color values for status/state indicators, No space-x-* / space-y-*, Prefer size-* over w-* h-* when equal (+4 more)

### Community 50 - "Community 50"
Cohesion: 0.17
Nodes (11): Configuring Registries, Setup, `shadcn:get_add_command_for_items`, `shadcn:get_audit_checklist`, `shadcn:get_item_examples_from_registries`, `shadcn:get_project_registries`, `shadcn:list_items_in_registries`, shadcn MCP Server (+3 more)

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (10): detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search stack-specific guidelines, search() (+2 more)

### Community 52 - "Community 52"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 53 - "Community 53"
Cohesion: 0.20
Nodes (9): Accessibility, Components, Dark mode, Design direction, Design System, Layout, Motion, Spacing (+1 more)

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (9): Accordion, Base vs Radix, Button / trigger as non-button element (base only), Composition: asChild (radix) vs render (base), Contents, Select, Select — multiple selection and object values (base only), Slider (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.28
Nodes (5): BM25, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query

### Community 56 - "Community 56"
Cohesion: 0.22
Nodes (9): Address Schemes, Build and Verify, GitHub Registries, Include, Item Definitions, Mental Model, Registry Authoring and Addresses, Registry Dependencies (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.22
Nodes (8): Available Domains, Available Stacks, How to Use, Output Formats, Prerequisites, Rule Categories by Priority, Search Reference, UI/UX Pro Max - Design Intelligence

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (8): Buttons inside inputs use InputGroup + InputGroupAddon, Contents, Field validation and disabled states, FieldSet + FieldLegend for grouping related fields, Forms & Inputs, Forms use FieldGroup + Field, InputGroup requires InputGroupInput/InputGroupTextarea, Option sets (2–7 choices) use ToggleGroup

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (5): Best Practices, Common Issues, Detailed patterns and worked examples, Responsive Design, When to Use This Skill

### Community 61 - "Community 61"
Cohesion: 0.33
Nodes (6): _detect_page_type(), format_page_override_md(), _generate_intelligent_overrides(), Detect page type from context and search results., Format a page-specific override file with intelligent AI-generated content., Generate intelligent overrides based on page type using layered search.

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (6): Accessibility, Interaction, Layout, Light/Dark Mode, Pre-Delivery Checklist, Visual Quality

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (6): How to Use This Skill, Step 1: Analyze User Requirements, Step 2: Generate Design System (REQUIRED), Step 2b: Persist Design System (Master + Overrides Pattern), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines (React Native)

### Community 64 - "Community 64"
Cohesion: 0.40
Nodes (5): Common Rules for Professional UI, Icons & Visual Elements, Interaction (App), Layout & Spacing, Light/Dark Mode Contrast

### Community 65 - "Community 65"
Cohesion: 0.40
Nodes (5): Example Workflow, Step 1: Analyze Requirements, Step 2: Generate Design System (REQUIRED), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines

### Community 67 - "Community 67"
Cohesion: 0.50
Nodes (4): Common Sticking Points, Pre-Delivery Checklist, Query Strategy, Tips for Better Results

### Community 68 - "Community 68"
Cohesion: 0.50
Nodes (4): Must Use, Recommended, Skip, When to Apply

### Community 70 - "Community 70"
Cohesion: 0.11
Nodes (18): Accessibility & Responsive, App shell, Audit — UX Problems Identified, Core shared components, Dashboard redesign, DataTable enhancements, Design Direction, Design tokens (`globals.css`) (+10 more)

### Community 71 - "Community 71"
Cohesion: 0.24
Nodes (6): authRoutes, navigationConfig, NavItem, publicRoutes, Breadcrumbs(), navFlat

### Community 72 - "Community 72"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, generate:api, lint, postinstall, start

### Community 73 - "Community 73"
Cohesion: 0.40
Nodes (4): Icons, Icons in Button use data-icon attribute, No sizing classes on icons inside components, Pass icons as component objects, not string keys

### Community 74 - "Community 74"
Cohesion: 0.40
Nodes (5): 1. Built-in variants, 2. Tailwind classes via `className`, 3. Add a new variant, 4. Wrapper components, Customizing Components

### Community 75 - "Community 75"
Cohesion: 0.50
Nodes (3): name, private, version

## Knowledge Gaps
- **472 isolated node(s):** `__filename`, `__dirname`, `compat`, `eslintConfig`, `withNextIntl` (+467 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 5` to `Community 4`, `Community 36`, `Community 6`, `Community 71`, `Community 8`, `Community 9`, `Community 10`, `Community 13`, `Community 20`, `Community 23`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 4` to `Community 66`, `Community 5`, `Community 6`, `Community 8`, `Community 9`, `Community 13`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `shadcn CLI Reference` connect `Community 44` to `Community 47`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `Generate full 16-token color row from 4 base colors.`, `Generate ui-reasoning row from products.csv row.`, `BM25 ranking algorithm for text search` to the rest of the system?**
  _503 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11260504201680673 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._