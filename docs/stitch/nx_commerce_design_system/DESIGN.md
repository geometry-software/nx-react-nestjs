---
name: NX Commerce Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  eyebrow-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  table-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  data-cell:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code-badge:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a high-performance, editorial SaaS aesthetic calibrated for digital commerce infrastructures, marketplace inventories, identity portals, and enterprise user directories. The visual identity projects architectural authority, functional clarity, and modern technical sophistication. 

Rooted in modern technical minimalism fused with precision editorial cues, the interface avoids generic enterprise bloat in favor of sharp typographic hierarchy, hairline dividers, deliberate spatial density, and disciplined color emphasis. The overall experience feels immediate, decisive, and calm under high data loads—delivering power users efficiency while greeting public catalog visitors with an immaculate, high-end store atmosphere.

## Colors

The color architecture enforces strict role separation between foundational surfaces, typographic scales, and purposeful interactive accents:

- **Primary Accent (`#4F46E5` / `#6366F1` / `#818CF8`):** Electric indigo-violet is reserved for primary conversions, active segmented items, focus boundaries, and primary interactive states. `#4F46E5` anchors core actions, while `#6366F1` serves as the primary hover state. `#818CF8` provides high-legibility accents against dark surfaces and focused states.
- **Secondary Accent (`#0EA5E9` / `#38BDF8`):** Sky cyan provides deliberate secondary touches for inline data metrics, real-time sync indicators, live catalog availability statuses, and dynamic badge contrasts.
- **Neutral & Canvas Foundation:**
  - Canvas App Background: `#F8FAFC` (Slate 50) and `#F1F5F9` (Slate 100) for structured app sectioning.
  - Surface Elevation Cards: `#FFFFFF` (Pure Crisp White) providing stark contrast against the slate canvas.
  - Hairline Boundaries: `#E2E8F0` (Slate 200) for subtle internal grid borders, and `#CBD5E1` (Slate 300) for active structural outlines and input borders.
  - Text & Structural Pigment: `#0F172A` (Slate 900) for high-impact headlines and body text; `#334155` (Slate 700) for secondary metrics; `#64748B` (Slate 500) for metadata and table headers; `#94A3B8` (Slate 400) for inactive icons and placeholder states.
- **Functional Semantics:**
  - Success: `#059669` (Emerald 600) with `#ECFDF5` tint surface.
  - Warning: `#D97706` (Amber 600) with `#FFFBEB` tint surface.
  - Critical / Destructive: `#DC2626` (Red 600) with `#FEF2F2` tint surface.

## Typography

The typographical strategy sets an editorial tension between the geometric, human-scaled geometry of Plus Jakarta Sans for titles and structural headers, paired with the razor-sharp numerical and compositional neutrality of Inter for high-density SaaS workflows.

- **Eyebrow Headers:** Transformed to uppercase with `0.06em` tracking. Used in auth views, card categories, and drawer sections to orient users without visual noise.
- **Data & Tables:** Data cells enforce tabular alignment standards (`font-variant-numeric: tabular-nums`) with 13px base sizing to maximize vertical density while preserving generous legibility across complex commerce transactions.
- **Key Caps & Badges:** Fixed at 11px semi-bold to keep modifier tags and keyboard navigation glyphs (like `⌘K`) strictly proportional to parent fields.

## Layout & Spacing

The structural layout relies on an adaptive fluid grid balanced with strict inner content maximum boundaries:

- **Desktop Layout (1200px+):** A 12-column grid utilizing a dynamic fluid width capped at `1440px` for directory and catalog listings, and centered at `480px` for independent authentication states. Column gutters are standard `1.5rem` (24px) with `3rem` (48px) margins.
- **Tablet Layout (768px - 1199px):** 8 columns, `1rem` (16px) gutters, and `1.5rem` (24px) page margins. Secondary utility sidebars collapse into responsive off-canvas panels.
- **Mobile Layout (<768px):** 4 columns, `1rem` (16px) gutters, and `1rem` (16px) outer edge margins. Dense data lists reflow from horizontal tables into stacked structured card items.
- **Rhythm Principle:** Internal card padding standardizes at `space-lg` (24px) for prominent content surfaces and `space-md` (16px) for compact utility widgets and table toolbars. Component internals use `space-xs` (4px) and `space-sm` (8px) gaps.

## Elevation & Depth

The design system eliminates heavy drop-shadows in favor of crisp hairline outlines combined with ultra-diffused, cool-tinted elevation levels. Surfaces rely on high-precision border framing to establish spatial depth:

- **Level 0 (Flat Ground):** `#F8FAFC` base application canvas with zero elevation.
- **Level 1 (Card & Content Blocks):** `#FFFFFF` pure white fill, framed by a `1px` solid border in `#E2E8F0`, accompanied by an ambient micro-shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Dropdowns, Menus & Filter Overlays):** `#FFFFFF` fill, `1px` solid `#CBD5E1` border, backed by a soft ambient shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Slide-over Drawers & Centered Modals):** Structural slide-over and modal containers feature clean hairline borders with deep ambient diffusion: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`. All overlay backdrops use `#0F172A` at `40%` opacity blended with a `4px` backdrop blur for clean separation.

## Shapes

The design system maintains a refined, soft structural geometry (`roundedness: 1`). This provides modern warmth while preserving technical crispness:

- **Standard Elements (0.25rem / 4px - 6px):** Inputs, table action buttons, badge containers, and keyboard shortcut glyphs.
- **Containers & Cards (rounded-lg / 0.5rem / 8px):** Catalog cards, user directory data tables, slide-over drawer inner modules, and authentication panels.
- **Structural Overlays (rounded-xl / 0.75rem / 12px):** Confirmation dialogs and root application modals.
- **Pill Exception:** Status indicators and semantic counter tags use a full circular radius (`9999px`) to maintain immediate, visual distinction from square interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#4F46E5` background, `#FFFFFF` text, `1px` transparent border. Hover shifts to `#6366F1` with an ambient glow (`box-shadow: 0 1px 2px 0 rgba(79, 70, 229, 0.3)`). Active: `#4338CA`.
- **Secondary / Outline:** `#FFFFFF` background, `#0F172A` text, `1px` solid `#CBD5E1` border. Hover: `#F8FAFC` fill and `#94A3B8` border.
- **Ghost:** Transparent background, `#334155` text. Hover: `#F1F5F9` background.
- **Destructive:** `#DC2626` text on `#FEF2F2` background with `#FEE2E2` border. Hover: `#B91C1C` text and `#FCA5A5` border.

### Search Bar & Keyboard Shortcut (⌘K)
- Single input container wrapped with `1px` solid `#CBD5E1`, `#FFFFFF` background, and `0.375rem` radius. Contains a slate search icon on the left and a right-aligned key cap badge.
- Shortcut badge (`⌘K`): Styled with `#F1F5F9` fill, `1px` border in `#E2E8F0`, `#64748B` text, and `11px` semi-bold mono alignment.

### Segmented Controls
- Contained within a `#F1F5F9` pill or rounded rail with `4px` internal padding.
- Inactive segments feature `#64748B` text with transparent background.
- Active segment transitions to pure white (`#FFFFFF`) with a `1px` border in `#E2E8F0`, `#0F172A` text, and a micro shadow (`0 1px 2px rgba(15, 23, 42, 0.06)`).

### Badge Pills & Status Indicators
- **Pending/Neutral:** `#F1F5F9` background, `#475569` text, `1px` solid `#E2E8F0`.
- **Active/Success:** `#ECFDF5` background, `#047857` text, `1px` solid `#A7F3D0`. Includes a 6px pulsing emerald dot.
- **Accent/Live (Cyan):** `#F0F9FF` background, `#0369A1` text, `1px` solid `#BAE6FD`.

### Data Tables & Row Actions
- Header row styled with `#F8FAFC` background, `table-header` typography, and a distinct bottom border in `#E2E8F0`.
- Data rows feature white backgrounds and `1px` bottom borders. Hovering reveals a light slate wash (`#F8FAFC`) and transitions previously hidden quick-action icon clusters (Edit, Impersonate, Copy ID) to full opacity on the right cell edge.

### Creation Drawers (Slide-overs)
- Slides out from the right edge with a fixed `480px` or `640px` width.
- Features a pinned header with uppercase eyebrow categorizations, an independent scrollable body padded at `space-lg`, and a docked bottom action bar containing Primary and Cancel options bordered by `#E2E8F0`.

### Modals & Dialogs
- Centered layout with maximum width of `512px`. Outlined with `#CBD5E1`, featuring a prominent status icon header, high-contrast action messaging, and stacked full-width or side-by-side right-aligned buttons.

### Toast Notifications
- Floating anchored items (bottom-right or top-right) with `#0F172A` deep graphite fill, pure white text, hairline `#334155` border, accompanied by semantic indicator icons and dismissal triggers.