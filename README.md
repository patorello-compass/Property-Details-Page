# Listing Detail Page — Compass LDP rebuild

A static rebuild of the production Compass Listing Details Page for
[159 E 63rd St, Manhattan](https://www.compass.com/homedetails/159-E-63rd-St-Manhattan-NY-10065/28YSFQ_pid/),
built on the Compass Design System token layer.

**The hero image slider is the piece built for iteration.** Everything below the
hero is deliberately lighter-weight — enough real structure to give the slider a
believable page around it, not a faithful reproduction of every module.

## Run it

```bash
node "Listing Detail Page/serve.mjs" 5273
```

Then open <http://localhost:5273>. `index.html` is a plain index that links to
the four versions — it loads no page chrome, so it can't be mistaken for one of
them. Any static server works; there is no build step, no bundler, and no npm
dependencies. (Opening over `file://` mostly works but the self-hosted fonts
will not load.)

## Layout

```
Listing Detail Page/
├── index.html              entry point — links to the four versions
├── heroSlider.html         15-photo listing (159 E 63rd St)
├── heroSliderMaxWidth.html …the same page with the gallery capped at 2600px
├── single-image.html       1-photo listing (807 Lake St S, Unit 301)
├── portrait.html           …the same listing with a 2:3 portrait photo
├── serve.mjs               Zero-dependency static server for local preview
├── css/
│   ├── tokens.css          Compass DS token layer (--cx-* custom properties)
│   ├── base.css            @font-face, reset, type scale, button recipes
│   ├── hero-gallery.css    ← the slider (heroSlider* pages only)
│   ├── hero-photo.css      single-photo hero (single-image / portrait)
│   └── page.css            Everything else
├── js/
│   ├── hero-gallery.js     ← the slider engine (heroSlider* pages only)
│   └── page.js             Binds the fixture into the shell
├── data/
│   ├── listing.js          15-photo fixture
│   ├── listing-single.js   1-photo fixture
│   └── listing-portrait.js …loaded after it, swaps in the portrait photo
└── assets/
    ├── fonts/              Compass Sans / Compass Serif / Open Sans (woff2)
    └── img/                15 gallery photos, 2 agent portraits, 2 map SVGs
```

The cx-icon sprite and the Compass logotype live inline at the top of
`heroSlider.html` — see **Design system grounding** below.

## Design system grounding

`css/tokens.css` mirrors `@uc/cx-design-tokens` — the same `--cx-*` custom
properties the production page pulls from
`https://www.compass.com/ucfe-assets/cx/4/cx.min.css`. Values come from the two
extraction docs in the parent folder, so the palette, type scale, spacing,
elevation and listing-status colors are the real ones, and the page works
offline.

Two things worth calling out:

- **Consumer mode, not Agent mode.** The Figma `Themes` collection has two
  modes that diverge (see `compass-ds-figma-extraction.md` §2b). `compass.com`
  is a consumer surface, so `Interactive/Primary` resolves to black rather than
  Blue 80, and `Border Radius/Buttons` to a pill rather than 2px. Those sit in
  a `--cx-consumer-*` block at the bottom of `tokens.css` — flip the components
  to the plain `--cx-color-interactive` / `--cx-spacing-buttonBorderRadius`
  tokens to see the agent-facing treatment.
- **Typography uses the Figma `Typographic Tokens` scale**, including its
  Desktop/Mobile modes (the `@media (max-width: 767px)` block at the end of
  `tokens.css`), not the flat legacy text variables.

Fonts are self-hosted copies of `ucfe-assets/fonts/3.10.0/*.woff2`.

**Icons** are the real ones. `heroSlider.html` opens with an inline `<svg class="cx-sprite">`
holding the Compass logotype and the subset of `cx-icons`
(`ucfe-assets/cx-icons/7/cx-icons.cdn.svg`) this page uses —
`magnifyingGlass`, `chevronDown`, `chevronLeft`, `starOutlined`,
`arrowRightInRectangle`, `squaresInThreeRows`, `plus`. They're inlined rather
than referenced as an external sprite because Chrome does not resolve
`<use href="file.svg#id">`. The five key-fact icons are still drawn locally
(production uses Google's Material Symbols for those, which would add an
external dependency); they carry `.cx-icon--stroke`.

## Header

The top bar and sticky sub-nav are measured off production, not approximated:

| | production | rebuild |
|---|---|---|
| Top bar height | 48px, 1px bottom border at 10% black | same |
| Logotype | 112 × 16 at (16, 16), `viewBox 0 0 112 16` | same, real SVG |
| Logo link | x 0, w 152, padding `0 24px 0 16px` | same |
| Search group | x 152, y 4, 420 × 40 | same |
| — field | 380 × 40, 1px #DADADA, radius `4px 0 0 4px` | same |
| — input | 378 × 38, padding 8px, 16px/18.4 | same |
| — placeholder | **14px**, #8D8D8D | same |
| — button | 40 × 40, black, radius `0 4px 4px 0` | same |
| Nav items | padding `0 10px`, 500 16/24; Buy at x 687 | x 688 |
| Register/Sign In | x 1297, w 133 | same |
| Sub-nav | 58px tall, 1px #C5C5C5 bottom border | same |
| — tabs | 14/21, #6C6C6C, 48px gap, first at x 136 | x 137 |
| — active tab | **black**, regular weight | same |
| — active underline | separate 2px black bar on the bar's bottom edge | `::after` on the active link |
| — Save / Share | 105 × 39, radius 9999px, 1px #ADADAD | same |

The active tab is worth a note: production draws the underline as a standalone
`sticky_nav__ActiveUnderline` div at the *container's* bottom edge, not under
the text, and the active label is pure black at regular weight. Here the link
stretches to the bar's full height so a `bottom: -1px` `::after` lands in the
same place without needing a separately positioned element.

Two details worth keeping: the search field and its button are a joined pair
(radius split across the two halves, 4px = `Shapes/Border Radius/Groups & Inputs`
in Consumer mode), and the placeholder is a size smaller than the input's own
text — 14px inside a 16px field.

### Capped-width variant — `heroSliderMaxWidth.html`

`heroSliderMaxWidth.html` is a byte-for-byte copy of `heroSlider.html` apart from one class on
the gallery section: `ldp-gallery--capped` stops the band at **2600px** and
centres it, instead of running full-bleed. It exists to compare the two
behaviours side by side — production caps its own gallery at 2000px and lets
the page keep growing around it.

Nothing in the engine changed. `HeroGallery` measures
`.ldp-gallery__viewport`, not `window.innerWidth`, so the cap propagates on
its own:

| viewport | gallery | photo band | slides in view | columns |
|---|---|---|---|---|
| 1920 | 1920 (uncapped) | 1888 | 848 × 450 | 3 |
| 2600 | 2600 (at the cap) | 2568 | 848 × 450 | 3 |
| 3440 | **2600**, centred | 2568 | 848 × 450 | 3 |

Past 2600 the slide count, band height and crops all freeze — the gallery just
gains white space either side while the content container below it stays at
its own 1100 cap. Paging, drag and the counter are unaffected.

The cap lives on `.ldp-gallery--capped` in `css/hero-gallery.css` as
`--gallery-max-width`, so it can be retuned in one place; the class is inert
on any page that doesn't apply it, which is why `heroSlider.html` is untouched.

## Content container

Production's container (`app__StyledMain`) is **fluid, not a fixed
max-width**. Measured on production across viewports:

| viewport | 900 | 1024 | 1200 | 1280 | 1440 | 1600 | 1920 | 2400 |
|---|---|---|---|---|---|---|---|---|
| container | 900 | 1024 | 1170 | 1170 | 1170 | 1280 | **1536** | 1536 |
| left col | 548 | 635 | 732 | 732 | 732 | 805 | 976 | 976 |
| right col | 280 | 317 | 366 | 366 | 366 | 403 | 488 | 488 |

That is **80% of the viewport, floored at 1170 and capped at 1536**, never
wider than the viewport itself — `clamp(1170px, 80%, 1536px)`.

**This prototype caps the container at 1100 instead** (`--ldp-container-max`
in `css/base.css`). 1100 sits *below* production's 1170 floor, so the fluid
rule no longer has anything to do: the container is a flat 1100 from 1100px
upwards and simply fills the viewport below that. Padding stays 24px each
side, so the inner content box is a constant 1052.

| viewport | 375 | 900 | 1024 | 1100 | 1440 | 1920 | 3440 |
|---|---|---|---|---|---|---|---|
| container | 375 | 900 | 1024 | 1100 | **1100** | **1100** | **1100** |
| content box | 343 | 852 | 976 | 1052 | 1052 | 1052 | 1052 |
| left col | — | 548 | 635 | 685 | 685 | 685 | 685 |
| right col | — | 280 | 317 | 343 | 343 | 343 | 343 |

Columns are still `2fr minmax(280px, 1fr)` with a 24px gap, which now resolves
to 685 / 343 above 1100 and still hands over to the 280 sidebar floor at 900.
The single-column collapse stays **below 769px**, not 1024 — production is
still two-column at 900px.

The key-facts grid narrows with it — 218px cards at every desktop width,
down from 315 — and none of the five labels or values clip at that width.

Two things deliberately do **not** follow the cap:

- **The hero gallery** (`heroSlider.html`, `heroSliderMaxWidth.html`) is full-bleed, so it is
  unaffected: 1888 of photo at 1920 while the content below is 1100.
  `heroSliderMaxWidth.html` caps the gallery separately at 2600.
- **The top bar and sub-nav** were always full-width with their own padding,
  measured off production.

`css/hero-photo.css` reads the same `--ldp-container-max`, so the
single-photo hero tracks the container without repeating the number.

## Containerized content cards

The content sections sit in bordered cards, taken from the **Containerization**
concept file ([node `6381:2814`](https://www.figma.com/design/I6tCuSmkKbYOsKgtn7N48K/Containerization?node-id=6381-2814)).
That file's `Main Container` is 1100 wide — which is where this prototype's
1100 container cap comes from.

Every section frame in the mock carries the same treatment, so `.ldp-card` is
one rule applied to all of them:

| | mock | rebuild |
|---|---|---|
| Fill | `#FFFFFF` (`Semantics/Background/Primary`) | `--cx-color-background` |
| Border | 1px `#DADADA`, bound to primitive `Neutral/Neutral 40` | 1px **`--cx-color-border`** (same value, semantic) |
| Radius | 8px | **`--cx-consumer-groupBorderRadius`** (4px) |
| Padding | 20px | same |
| Gap between cards | 16px | same (`.ldp-main > * + *`) |
| Section title | `Headers/H4`, 24px, black | same — unchanged from before |
| Sidebar block | same card, 20px padding, 12px gap | same |

### Surfaces

The page sits on an accent surface so the white cards read as raised:

| surface | token | value |
|---|---|---|
| Page (`body`) | `--cx-color-backgroundAccent` | `#F4F4F4` (Neutral 20) |
| Top bar, sub-nav | `--cx-color-background` | `#FFFFFF` |
| Hero band / hero photo section | *unfilled* | page shows through |
| Content cards, sidebar card | `--cx-color-background` | `#FFFFFF` |
| Portrait mat | `--cx-color-grey30` | `#E8E8E8` (Neutral 30) |
| Key-fact sub-cards, MLS strip | `--cx-color-backgroundAccent` | `#F4F4F4` |

The hero band and hero-photo section used to paint white; they are unfilled now
so the accent surface shows through the hero's 16px top gap and side gutters,
as the mock's slideshow frame does.

**Two notes for the Design System team**, both surfaced by this change:

1. **The mock's page is Neutral 10 (`#FAFAFA`), not Neutral 20.** Its `Desktop`
   frame binds `Neutral/Neutral 10`. This prototype uses Neutral 20 by choice.
   The consequence is that every `#F4F4F4` element loses contrast against the
   page — hence the portrait mat stepping down to Neutral 30.
2. **The portrait mat has no semantically correct token.** It needs a "mat /
   inset surface" one step darker than the page. The only semantics that
   resolve to `#E8E8E8` are `Background/selectedBackground` (a selection
   state) and `Border/Disabled` — both wrong in meaning — so the mat binds the
   **primitive** `--cx-color-grey30`, against the usual prefer-semantics rule.
   The same gap applies to the MLS footer strip, which is still Neutral 20 and
   therefore the same colour as the page.

### Where this follows the design system instead of the mock

Per the skill's `card.md` reference, the DS Card is built on
`Neutral 0 (White)` + `Neutral 40` with a `Shapes/Border Radius/Groups & Inputs`
radius, and `card.md` explicitly flags the primitive bindings as a known token
gap. So:

- **The border binds the semantic `--cx-color-border`**, not the primitive.
  Same `#DADADA`, but it survives a theme change.
- **The radius uses the `Groups & Inputs` token** — 4px in Consumer mode. The
  mock draws 8px, which is not any radius token in that mode (`Groups & Inputs`
  is 4, `Buttons` is 36, `Icon-Only Squared Buttons` is 8). Set
  `--ldp-card-radius: 8px` on `.ldp-card` to match the mock instead — that is
  the one knob.

Two values had no DS equivalent to defer to, so they stay literal and are
called out rather than dressed up as tokens:

- **20px padding.** The spacing scale has 16 and 24, not 20.
- **12px footer padding** and the 12px sidebar gap, same reason.

### The joined footer strip

In the mock, the MLS line sits in a `Neutral 20` strip that completes the
Description card: the card above loses its bottom corners and drops to 12px
bottom padding, and the strip carries the bottom radius. `.ldp-meta` renders
as that strip.

The join is driven by `:has(+ .ldp-card__footer)` rather than a wrapper, so it
follows the content:

- **`heroSlider.html` / `heroSliderMaxWidth.html`** — the strip joins the **Listing Agents**
  card, which is what precedes it in our markup.
- **`single-image.html` / `portrait.html`** — `page.js` removes the Listing
  Agents section (no agents in the fixture), so the strip joins the
  **Description** card instead, exactly as in the mock. No markup change, no
  JS change.

No content was added or reordered for any of this — only the container
classes. The card order is still ours: summary, key facts, Description,
Listing Agents, MLS strip, Location, Payment Calculator.

## Summary row, key facts and vertical rhythm

| | production | rebuild |
|---|---|---|
| Est pill | `500 12/18`, `4px 8px`, radius 999px, bg #E8E8E8, gap 4px, h 26 | same |
| — alignment | vertically centred on the price, not baseline | same |
| — link | #242424, underlined | same |
| Key facts grid | `repeat(3, 1fr)`, gap 16px | same |
| — card | 233 × 60, padding `10px 20px`, radius **6px**, bg #F4F4F4, gap 16px | same |
| — icon | 24 × 24 | same |
| — value | `500 16/20.8`, black | same |
| — label | `14/18.2`, #6C6C6C | same |

The key-fact count is per listing, not fixed: 5 on both of ours, matching each
listing's own production page (the Newport listing in the reference screenshot
has 6, which the same 3-column grid handles).

**Vertical rhythm** below was production's, measured before the cards went in.
The card gap (16px) now governs the spacing *between* sections; these values
still describe the rhythm *inside* each card:

| | production |
|---|---|
| Summary section | padding `24px 0` |
| Key facts → first section | **24px** |
| Between later sections | **32px** |
| Under every section heading | **12px** |
| Days-on-market block | 16px above, `16px 0` padding |

Price, status and key-fact values are pure black in production rather than
Neutral 120, so they're set explicitly.

## Summary row and sidebar

The **map thumbnail belongs to the summary block, not the sidebar.**
`summary__Root` is a flex row (`gap: 10px`, `padding: 24px 0`, w 732) whose
second child is the map — so it sits flush against the right edge of the main
column, top-aligned with the price text, at 120 × 120 with a 5px radius. The
sidebar has no map at all.

| | production | rebuild |
|---|---|---|
| Summary | x 159, w 732, flex, gap 10px, padding `24px 0` | same |
| — text column | grid, w 602 | same |
| — map | 120 × 120, radius **5px**, x 771, y 596 | same |
| Sidebar | x 915, w 366, first block 24px down | same |
| — avatar | **96 × 96** (`cx-avatar--xxl`), 16px gap | same |
| — name | 500 18/27 (Subheader 2 Medium) | same |
| — company / phone | 14/21 | same |
| — Request a tour | 277 × 60, radius 9999px | same |
| — Contact an agent | 277 × 39, radius 9999px, 1px #ADADAD | same |
| Listing Agents avatar | **96 × 96**, x 175, row gap 16px | same |

Both CTAs are capped at `max-width: 277px` rather than filling the 366px
column, and the avatars are the design system's XXL size — 96px, not the 56px
a quick read of the screenshot suggests.

## The hero slider

Geometry was measured off the live page rather than eyeballed. The frame
matches production to the pixel:

| | production | rebuild |
|---|---|---|
| Band | full-bleed, 16px gutter, 450 tall | same |
| Gap | 12px | 12px |
| Section box | y 106, h 466 (16px above the band) | same |
| Badges | y 138 / 170, h 24, radius 4px | same |
| Prev/next | 38 × 38 at x 1374, y 328; chevron **11 × 11**, #333 | same |
| Floor Plan / Street View | x 28 / 138, y 524, w 98 / 108, **no icons** | same |

Inside that frame the slide layout differs from production on purpose — see the
sections below.

### Item counts per breakpoint

A view is one big photo plus a grid of small ones, and how many small ones is
a function of viewport width. Measured on production
(`/homedetails/93-W-13th-St-Unit-12-…`, 35 photos) and matched exactly:

| viewport | band height | page gutter | small photos | grid |
|---|---|---|---|---|
| < 768 | 336 | 0 | — | one photo per slide |
| 768–1023 | 354 | 0 | **2** | 1 col × 2 rows |
| 1024–1279 | 450 | 0 | **4** | 2 × 2 |
| 1280–1535 | 450 | 16px | **4** | 2 × 2 |
| ≥ 1536 | 450 | 16px | **6** | 3 × 2 |

Those thresholds are the `cx-design-tokens` media queries — 768 `tablet`,
1024 `tabletLandscape`, 1280 `laptop`, 1536 `desktop`.

### Past production's cap

Production stops the gallery at `max-width: 2000px; justify-self: center`, so
beyond ~2030px the browser keeps growing and the photos don't. We stay
full-bleed instead and keep adding columns, so cells never stretch into
letterbox strips:

Ours keeps filling the viewport. Past ~2030px that surplus width goes into
**more slides per view** rather than wider ones (see *Ultra-wide* below), so a
grid still holds 6 photos and the big photo keeps its aspect. The count per
grid stays pinned to the table above at every width, even where that leaves
cells squat (1.10 at 1536, 2.60 at 900 — production does the same).

### Slide sequence

Production's rule, reproduced exactly: **the first photo gets a slide to
itself, the rest are packed `columns × 2` to a slide, and any tail too short
to fill a grid falls back to big photos.** With 15 photos and a 2 × 2 grid
that's `big, grid, grid, grid, big, big` — the last two at 50% each.

Every slide is the same width, which is what lets a page tile flush:

```
slideW = (W − gap × (perView − 1)) / perView
cellH  = (H − gap) / 2
cellW  = (slideW − (c − 1)·gap) / c
```

| viewport | per view | slide | big photo | small photos | cell |
|---|---|---|---|---|---|
| 900 | 2 | 444 | 444 × 354 | 2 | 444 × 171 |
| 1024 | 2 | 506 | 506 × 450 | 4 | 247 × 219 |
| 1440 | 2 | 698 | 698 × 450 | 4 | 343 × 219 |
| 1536 | 2 | 746 | 746 × 450 | 6 | 241 × 219 |
| 1920 | 2 | 938 | 938 × 450 | 6 | 305 × 219 |
| 2257 | **3** | 734 | 734 × 450 | 4 | 361 × 219 |

Every production width reproduces its pixel geometry exactly.

**How many columns follows the slide, not the viewport.** The ladder is
production's breakpoints restated as slide widths — at two per view a 1024
viewport gives a 506px slide and 1536 gives 746px — so it matches production
while still sizing the grid sensibly once a third slide narrows every slide.

### Band height is capped at production's 450

`--gallery-max-height: 450px` is a hard ceiling, so the hero section is never
taller than it is today (466 including the 16px above the band). The band-growth
machinery is still there — raise that value and the band will grow taller to
hold `--gallery-hero-ratio` — but at 450 it's pinned.

**The consequence is that the big photo's aspect sawtooths as the viewport
widens.** With the band fixed and slides tiling the width, a slide's aspect is
just `slideWidth ÷ 450`, and the only way to bring it back down is to fit
another slide in. Measured from a 1512px laptop:

| zoom | viewport | per view | big photo | grid | cell |
|---|---|---|---|---|---|
| 100% | 1512 | 2 | 734 × 450 · **1.63** | 4 | 361 × 219 · 1.65 |
| 90% | 1680 | 2 | 818 × 450 · **1.82** | 6 | 265 × 219 · 1.21 |
| 80% | 1890 | 2 | 923 × 450 · **2.05** | 6 | 300 × 219 · 1.37 |
| 75% | 2016 | **3** | 653 × 450 · **1.45** | 4 | 321 × 219 · 1.46 |
| 67% | 2257 | 3 | 734 × 450 · **1.63** | 4 | 361 × 219 · 1.65 |

It climbs to ~2.1, drops when a slide is added, and climbs again — 67% lands
back exactly where 100% started. That drift is unavoidable at a fixed height;
`--gallery-max-slide-ratio` (2.1) sets how tall the teeth are. Lowering it to
~1.75 halves the swing but steps to three slides at ~1620, which means 1920 no
longer matches production's two.

JS solves the widths and writes them back as `--gallery-hero-width`,
`--gallery-cell-width`, `--gallery-cell-height` and `--gallery-columns`; the
stylesheet consumes them.

### Paging

Paging walks real slide offsets and packs whole slides into each page rather
than assuming a fixed step, so the same code handles two, three or four slides
per view. At 1440 that lands on −1420 and −2840 — production's own translate
values.

### Why not Flickity

Production uses Flickity. This is a purpose-built ~300-line module instead, so
the behaviour we actually want to tune is in one readable file with no library
semantics in the way — and no GPL/commercial licensing question for a
throwaway prototype. It reimplements the parts that matter:

- grouped paging (advance a whole view, not one cell)
- `contain` — the track never over-scrolls past either end
- pointer drag with rubber-banding at the ends and velocity-aware snapping
- keyboard arrows, lazy loading past the first view, a `change` event

### Tuning it

Every number lives in one place. CSS geometry is on `.ldp-gallery` in
`css/hero-gallery.css`:

```css
--gallery-height: 450px;
--gallery-gap: 12px;
--gallery-page-gutter: 16px;
--gallery-inset: 12px;        /* overlay controls, from the band edge */
--gallery-per-view: 2;          /* slides sharing the band */
--gallery-max-height: 450px;    /* hard ceiling — production's own height */
--gallery-hero-ratio: 1.56;     /* aspect the band would grow to hold, if allowed */
--gallery-max-slide-ratio: 2.1; /* one more slide rather than let one exceed this */
--gallery-max-ratio: 1.85;      /* same guard, one level down, for grid cells */
--gallery-duration: 420ms;
--gallery-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

The column floor per breakpoint is `COLUMN_LADDER` in `js/hero-gallery.js`;
drag feel is `dragThreshold` / `flickVelocity` in `DEFAULTS`.

The engine reads height, gap and ratios **back out of the DOM** on every solve
pass, so changing the CSS custom properties is enough — no JS change needed to
retune geometry.

## The single-image page

`single-image.html` is the same page with a one-photo hero, modelled on
[807 Lake St S, Unit 301](https://www.compass.com/homedetails/807-Lake-St-S-Unit-301-Kirkland-WA-98033/1S0KVJ_pid/).
Everything below the hero is byte-identical to `heroSlider.html` — same chrome,
same CSS, same `js/page.js`.

**The hero is not a carousel.** A one-photo listing gets a plain image, so it
has its own component (`css/hero-photo.css`, `.ldp-hero-photo`) with no track,
no slides, no paging, and no dependency on the gallery. The page doesn't load
`hero-gallery.css` or `hero-gallery.js` at all; `page.js` wires whichever hero
is present and skips the other.

| | 15-photo hero | 1-photo hero |
|---|---|---|
| Component | `.ldp-gallery` + `hero-gallery.js` | `.ldp-hero-photo`, CSS only |
| Width | full-bleed, viewport − 32 (1408 @ 1440) | **content container** − 32 |
| Prev / next | yes | none |
| Buttons | Floor Plan, Street View, *N* Photos | **Street View only** |
| Below the image | nothing | **MLS attribution caption**, 10px below |
| Badges | source + status | listing-status (`Listing/ComingSoon`) |

The two share the badge markup — the host element names its own class via
`data-badge-class`, so `page.js` builds them without knowing which hero it's
in — and they share the same height ladder (450 / 354 / 336), so the crops stay
in the same territory.

### Sized to the content container; the mat is portrait-only

The frame spans **the container's full content box** — the same left and right
edges as everything below it, main column and sidebar together. At a fixed 450
height that is a wide window, and the landscape photo crops to fill it:

| viewport | frame | landscape photo | aspect |
|---|---|---|---|
| 375 | 343 × 336 | 343 × 336 | 1.02 |
| 900 | 852 × 354 | 852 × 354 | 2.41 |
| 1024 | 976 × 450 | 976 × 450 | 2.17 |
| 1100 | 1052 × 450 | 1052 × 450 | 2.34 |
| 1440 | 1052 × 450 | 1052 × 450 | 2.34 |
| 1920 | 1052 × 450 | 1052 × 450 | 2.34 |

With the container capped at 1100 the crop settles at a constant **2.34** from
1100px up — a little wider than the carousel's widest slide (2.10) but in the
same territory, and it no longer drifts with the viewport. Before the cap this
reached 3.31 at 1920.

The **mat** (`--hero-photo-mat`, Neutral 20, with `--hero-photo-mat-pad`) is a
**portrait-only override**, not a base behaviour. The base sets the mat
transparent at zero padding so the landscape photo reaches the frame's edges;
`.ldp-hero-photo--portrait` switches both on. That single pair of custom
properties is the whole difference between the two pages.

The two overlays anchor to different boxes, which is the reason `__actions`
sits outside `__media`:

- **Badges** are on `__media`, sized to the photo, so they stay on the image
  wherever it lands — top-left of the photo on both pages.
- **Street View** is on `__frame`, offset by `mat-pad + inset`. With no mat that
  collapses to a plain 12px inset; with the portrait mat it clears the grey.
  Either way the button lands in the same visual spot, and neither page needs
  a special case.

### Portrait photos — `portrait.html`

`portrait.html` is `single-image.html` with one thing changed: a 2:3 photo
instead of a landscape one. It loads the same fixture and then
`data/listing-portrait.js` swaps the photo, so orientation is the only
variable.

A portrait photo is the case the landscape frame can't absorb. At 1052 × 450 a
cover crop would keep roughly a 28% horizontal band of a 2:3 source — the
subject disappears. So the photo runs at its own ratio and the mat takes the
rest of the frame:

| viewport | frame (mat) | photo | crop |
|---|---|---|---|
| 375 | 343 × 336 | 213 × 320 · **0.667** | none |
| 900 | 852 × 354 | 220 × 330 · **0.667** | none |
| 1024 | 976 × 450 | 284 × 426 · **0.667** | none |
| 1100 | 1052 × 450 | 284 × 426 · **0.667** | none |
| 1920 | 1052 × 450 | 284 × 426 · **0.667** | none |

Same frame, same 450 ceiling — the photo is simply narrow, so most of the frame
is grey: 384px of mat either side above 1100. Zero crop at every size, and
the variant is four declarations (the two mat properties, plus `width: auto`
and `object-fit: contain`).

### Mechanically

```
.ldp-hero-photo          section — content container, 24px gutter, 16px top
  └ __frame              the container's content box, 450 tall; mat if portrait
      ├ __media          the photo's box — fills the frame, or natural if portrait
      │   ├ __img        object-fit: cover (contain when portrait)
      │   └ __badges     absolute, 12px inset — rides with the photo
      └ __actions        absolute, mat-pad + inset from the frame's corner
  └ __caption            10px below, spanning the frame
```

Tunables live on `.ldp-hero-photo`: `--hero-photo-height`, `--hero-photo-mat`,
`--hero-photo-mat-pad`, `--hero-photo-gutter`, `--hero-photo-inset`,
`--hero-photo-top-gap`, `--hero-photo-caption-gap`. `--hero-photo-gutter`
mirrors `.ldp-container`'s padding — change that and this needs changing with
it. The mat pair is overridden by `.ldp-hero-photo--portrait`.

### Data-driven differences

`js/page.js` is shared, so anything a variant can omit is read through a
guard. The single fixture exercises: `hero.variant` / `hero.caption`,
`buildingInfo: null`, `agents: []` (drops the Listing Agents section *and* the
sidebar contact block), `description.listedBy` (the attribution line
production shows in their place), `meta.daysOnMarket: null`, `statusColor`,
and `maps` overrides.

## Deliberately out of scope

Per the brief, these were left as stubs so the effort went into the slider:

- **The photo lightbox.** Clicking a photo logs the index
  (`onPhotoActivate` in `js/page.js`); there is no modal.
- Floor Plan / Street View / Save / Share / Contact are inert.
- The payment calculator renders the production values but does not compute.
- Maps are hand-drawn SVG placeholders — the production page uses Google Static
  Maps, which needs a key.
- Property Info, Property History, Schools and Similar Homes sections are not
  built; the section nav links to the sections that exist.

## Content

Listing copy, photos and agent portraits are copies of the production listing,
used as placeholders for layout work.

The single-image hero photo (`assets/img/single-hero.jpg`) is cropped from the
original: the source carries a "Made with AI" disclosure chip in the top-right
corner and a Northwest MLS watermark bottom-right, both burned into the image
by the listing agent rather than added by the page. 80px off the top and bottom
takes out both, leaving 1536 × 864. The MLS is still credited in the caption
under the photo.
