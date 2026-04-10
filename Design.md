# Open BookShelf — Design System

A living design reference for Open BookShelf — a cross-platform digital library manager for iOS, Android, Web, and Desktop.

---

## 1. Design Philosophy

### Visual Identity

Open BookShelf should feel **cool and intellectual** — the digital equivalent of a well-curated private library or an architecture monograph. Think: clean lines, deliberate silence, the confidence of a space that doesn't need to shout. The interface earns authority through restraint, not ornamentation.

The visual mood draws from references like:
- Academic and literary journals — sparse, high-contrast, typographically rigorous
- Modernist architecture photography — monochrome, geometric, precise
- Premium editorial design — generous whitespace, structured grids, no decorative noise

### Tone in One Sentence

> *The design is cooler than it is warm, more intellectual than playful, and more confident than friendly.*

### Core Principles

**Monochrome authority** — A near-colorless palette is not a limitation; it is the statement. The absence of decorative color communicates maturity and focus. Color appears only where it carries information.

**Content-first** — Book covers are the primary visual element. Every UI decision should ask: "does this compete with the cover?" If yes, dial it back.

**Typographic hierarchy** — The pairing of a Japanese serif (Noto Serif JP) with a geometric grotesque (Space Grotesk) is deliberately intellectual. Serif for ideas; grotesque for function. The contrast between them carries the design's personality.

**Cold over warm** — When in doubt, lean toward cooler, blue-gray tones rather than warm beige or cream. The palette should feel more like steel and paper than wood and leather.

**Honest chrome** — Navigation and controls exist only to serve the content. They should be visually quiet and structurally clear — never decorative, never playful.

**Consistent across surfaces** — The same cool, measured visual identity should be recognizable whether the app is running on an iPhone or a desktop. Layout adapts; character does not.

---

## 2. Color

The palette is **monochromatic by design** — this is a deliberate aesthetic choice, not a constraint. Cool blue-gray tones underpin every surface. Color appears only where it carries semantic meaning (reading status). The result is an interface that feels precise and self-assured, like a printed design book.

### 2.1 Palette

The overall hue of the palette leans **cool**: whites with a faint blue-gray cast, near-blacks with blue-gray depth. Avoid warm beiges, cream whites, or reddish-gray tones — they undermine the intellectual character.

| Role | Light | Dark |
|------|-------|------|
| **Background** | `#ffffff` | `#0b0c0f` |
| **Surface** (cards, panels) | `#f7f9fc` | `rgba(15,18,24,0.92)` |
| **Surface Muted** (subtle containers) | `#eef1f6` | `rgba(15,18,24,0.75)` |
| **Surface Strong** (headers, elevated) | `#e6eaf1` | `#151a22` |
| **Text Primary** | `#111318` | `#e6e8ee` |
| **Text Secondary** (metadata, captions) | `#3a3f48` | `#b7bcc7` |
| **Border Subtle** (dividers, inputs) | `#d6dbe4` | `#2a2f3a` |
| **Border Strong** (visible outlines) | `#b6bdc9` | `#3a414f` |

Background gradients flow softly top-to-bottom (`bg0 → surfaceMuted`) to give depth without decoration. They reinforce the cool blue-gray atmosphere; never use warm-toned gradients.

### 2.2 Reading Status Colors

These are the **only** saturated colors in the system, and they are reserved exclusively for reading-status indicators on book cards.

| Status | Color | When to use |
|--------|-------|-------------|
| Want to Read | `#3B82F6` | Badge icon on book card |
| Reading | `#F97316` | Badge icon on book card |
| Finished | `#22C55E` | Badge icon on book card |

> **Rule**: These three colors must not appear anywhere outside of reading-status contexts — not in buttons, alerts, tags, or highlights.

### 2.3 Dark Mode

Dark mode is the **primary showcase** of the app's cool, intellectual identity. The dark palette trends toward deep blue-gray (not pure black or warm charcoal) to create a sense of depth and precision. Surfaces carry slight transparency to allow layer depth to show through. In dark mode, the app should feel like a professional tool — a high-contrast design environment rather than a dimmed-down light mode.

---

## 3. Typography

Two typefaces, each with a clear domain. Their contrast — classical serif meets geometric grotesque — is the primary source of the app's intellectual character:

| Family | Domain | Why |
|--------|--------|-----|
| **Noto Serif JP** | Content — titles, headings, descriptions, book-related copy | Classical serifs carry intellectual weight; strong CJK coverage for Japanese and Korean titles; the letterforms reference print media and academia |
| **Space Grotesk** | Interface — labels, buttons, metadata, navigation, form fields | A precise, geometric grotesque. Cool rather than friendly. Pairs with the serif by contrast — one is literary, the other architectural |

**The rule is simple**: if it's about a book, use Noto Serif JP. If it's about the app, use Space Grotesk.

The pairing should read as **rigorous, not playful**. Both families are chosen for structure and legibility, not personality or warmth.

### Scale

| Context | Size | Weight | Family |
|---------|------|--------|--------|
| Screen / section heading | Large (`$xl`–`$2xl`) | Bold | Noto Serif JP |
| Book title on card | Medium (`$md`) | Medium | Noto Serif JP |
| Book title on detail screen | Large (`$xl`) | SemiBold | Noto Serif JP |
| Author / series name | Small (`$sm`) | Regular | Space Grotesk |
| Metadata fields (date, format, size) | Small (`$sm`) | Regular | Space Grotesk |
| Button label | Small (`$sm`) | SemiBold | Space Grotesk |
| Badge / caption | Extra-small | Regular | Space Grotesk |

Never mix both families within a single text element. Never hardcode font names in components — reference `typography.primary` and `typography.secondary` from `app/theme`.

---

## 4. Spacing & Layout

Base unit: **4 px**. All spacing values are multiples of this unit.

| Value | Common use |
|-------|-----------|
| 4 px | Tight icon padding, badge insets |
| 8 px | Gap between inline elements |
| 12 px | List item vertical padding |
| 16 px | Standard screen horizontal margin |
| 24 px | Between sections |
| 32 px | Large block separations, hero areas |

### Responsive Layout

The app has two layout modes, toggled by `useConvergence().isLarge`:

**Compact** (phone): single-column screens, bottom tab navigation, floating action button at bottom-right.

**Large** (tablet / desktop): multi-column grid in the library, persistent left sidebar, action controls shift to top-right.

Library grid density:
- Compact: 2 columns
- Large: 4–6 columns (adapts to window width)

Book detail: full-screen on compact, right-panel overlay on large.

### Safe Area

All interactive elements and content must respect device safe areas. Bottom-edge FABs and navigation bars account for `insets.bottom` automatically.

---

## 5. Iconography

Source: **Material Community Icons**, wrapped in the app's `MaterialCommunityIcon` component.

| Size | Approx | Use |
|------|--------|-----|
| `sm` | 16 px | Reading-status badges, inline indicators |
| `md-` | 20 px | Toolbar secondary actions |
| `md` | 24 px | Standard toolbar icons |
| `lg` | 32 px | Empty-state illustrations |

Icon color defaults to the text primary color of its context. Use reading-status colors only on status badge icons. Inactive or disabled icons use text secondary.

---

## 6. Key UI Patterns

### 6.1 Book Card

The cover is the hero. Text and overlays are minimal. Interaction reveals depth progressively.

```
┌────────────────┐
│                │
│  [status icon] │  ← top-right, 20 px, color-coded
│                │
│  [hover menu]  │  ← visible on web hover / native long-press only
│                │
│ ████░░░░░░░░░░ │  ← reading progress bar, 3 px, bottom edge
└────────────────┘
  [○]               ← selection checkbox, visible in multi-select mode only
```

- Progress bar fill: `#3B82F6`; track: surface muted
- Hover/long-press menu: `surfaceStrong` background, no shadow — border separation only
- Selected state: accent-colored checkbox, subtle border on card

### 6.2 Book Metadata Display

Book metadata (author, series, tags, format, date) should be visually subordinate to the title and cover.

```
[Cover]   BOOK TITLE                ← Noto Serif JP, large, primary
          Author Name               ← Space Grotesk, small, secondary
          Series · Vol. 3           ← Space Grotesk, small, secondary
          ★★★★☆                    ← Rating component
          epub · 2.4 MB · 2023     ← Space Grotesk, caption, secondary
```

Tags are displayed as small monochrome chips — never colorful labels.

### 6.3 Buttons

No color in buttons. Emphasis is expressed through fill, not hue.

| Variant | Appearance | Use |
|---------|-----------|-----|
| `outline` | Transparent background, border | Default action |
| `solid` | Filled with surface strong, border | Primary / emphasized action |

There is intentionally no "primary blue" or "success green" button. A `solid` button is the strongest call-to-action available.

### 6.4 Header & Navigation

- Fixed header height: 50 px
- Background: surface strong
- Separator: 1 px border subtle, bottom edge
- Left sidebar (large layout): always visible, 240–280 px wide, surface background
- Left sidebar (compact): slide-in drawer on demand

### 6.5 Modals & Popovers

- Background: surface, 12 px border radius
- Border: border subtle
- Backdrop: `rgba(0, 0, 0, 0.4)`
- Entry animation: fade + 8 px upward slide, 300 ms ease-out

---

## 7. UI States

Every screen or component that loads data must handle all four states:

### Loading
Use a subtle spinner or skeleton — never a full-screen block. For the library grid, render skeleton cards at the same size as real cards to prevent layout shift.

### Empty
Empty states should feel human, not mechanical. Use a large icon (32 px+) from Material Community Icons paired with a brief, friendly message in Noto Serif JP. Offer a clear primary action (e.g., "Connect to a Calibre server").

### Error
Display errors inline, not as modal interruptions. Error text in text secondary color. No red error colors — the monochrome palette applies here too. Offer a retry action using an `outline` button.

### Success / Confirmation
Avoid success toasts for routine actions (downloads, saves). Use them only for actions that take more than 2 seconds or could fail silently. Keep duration to 2–3 seconds.

---

## 8. Motion

One timing token: **300 ms ease-out**. Applied consistently to all transitions.

| Pattern | Use |
|---------|-----|
| Fade + 8–12 px slide up | Panel, modal, drawer entry |
| Fade only | Overlay show/hide (viewer controls) |
| Staggered fade | Multiple items entering together (40 ms delay per item) |
| None | List scroll, image load, page turn (native behavior preferred) |

**Do not use** spring or bounce animations. They imply playfulness that conflicts with the calm reading environment.

---

## 9. Reading Experience (Viewer)

The viewer is the most important screen. Design for distraction-free reading.

**Default state**: full-screen, zero chrome. Only the content is visible.

**On tap**: header and optional footer fade in (300 ms). Tap again or wait 4 seconds to hide.

**Header contents**: back arrow + truncated book title + overflow menu for viewer settings. Nothing else.

**Reading background**: always `bg0`. No "sepia" or tinted modes by default — the system dark/light mode handles this. Custom reading themes can be a future addition.

**Progress**: shown as a slim bar at the bottom of the screen (not a floating badge or percentage label).

| Format | Approach |
|--------|---------|
| PDF | Preserve original page layout; do not reflow |
| HTML/EPUB | Inject minimal CSS: font, background, and text color from the active palette |

---

## 10. Accessibility & Internationalization

### Accessibility
- All interactive elements: minimum 44×44 px touch target
- Text contrast: WCAG AA minimum (4.5:1 for body, 3:1 for large text)
  - Light `#111318` on `#ffffff` ≈ 18.7:1 ✅
  - Dark `#e6e8ee` on `#0b0c0f` ≈ 15.2:1 ✅
- Do not suppress focus rings on web
- Meaningful `accessibilityLabel` on all icon-only buttons

### Internationalization

| Locale | Writing system | Direction |
|--------|---------------|-----------|
| English (en) | Latin | LTR |
| Korean (ko) | Hangul | LTR |
| Arabic (ar) | Arabic | **RTL** |

For RTL: avoid hardcoding `left`/`right`. Use `start`/`end` flex properties and Gluestack's RTL-aware layout props. The left sidebar becomes a right sidebar in RTL automatically.

Noto Serif JP covers Latin, Japanese, and Korean at all weights. Arabic falls back to the system serif (Noto Naskh on most platforms).

---

## 11. What to Avoid

| ❌ Don't | ✅ Do instead |
|---------|-------------|
| Colorful primary buttons | `solid` variant button (monochrome) |
| Warm beige / cream surfaces | Cool blue-gray tones only |
| Drop shadows on cards | Border separation (`borderSubtle`) |
| Decorative gradients | Background wash gradients only, cool-toned |
| Mixing font families in one element | Noto Serif for content, Space Grotesk for interface |
| Rounded, friendly corner radii (> 12 px) | Precise, restrained rounding (8–12 px) |
| Spring / bounce animations | 300 ms ease-out fade+slide |
| Playful or illustrative empty states | Structural icons + terse copy in the app's voice |
| Color to indicate error or warning | Textual messaging with monochrome icons |
| Hardcoded `left`/`right` in layout | Flex `start`/`end`, RTL-safe props |
| Status colors (`#3B82F6`, `#F97316`, `#22C55E`) outside book-status badges | Reserve them strictly for reading status |
| Full-screen loading spinners | Inline skeletons or localized spinners |
