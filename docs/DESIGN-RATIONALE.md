# TAS Group of Companies - Design & Strategy Rationale

**Brand 3 of the Internal Creative UI/UX & Frontend Challenge**
Live site: https://tas-group.vercel.app
Repository: https://github.com/Preethinthran/tas-group-website

---

## 1. The brief, and our reading of it

TAS Group (founded 1978, Butterworth, Penang) is a maritime group: TAS Agency, TAS Maritime, TAS Freight Services, TAS Management Holdings, plus Bexxbay Express and Ganu Jaya. The brief asks us to rebrand an established industrial enterprise as a forward-thinking logistics leader, with interactive route maps, multimodal explorers and bold nautical-industrial typography, and to avoid dry corporate tables, dated layouts and walls of static text.

Our reading: the group's real strength is not a single service, it is **one accountable chain from vessel arrival to final delivery**, rooted in waterfront operations. Every decision below serves one idea:

> **"Moving global trade, from port to destination."**

The page is structured as that journey. The visitor scrolls from the quayside (story, capabilities, maritime operations) out across the region (network map) and into the buyer's own task (quote and tracking), then to proof (why TAS, cargo, responsibility) and contact.

### Honesty rules we set ourselves

This is a pitch to a real company, so the prototype never fabricates facts.

- Only the five locations that TAS lists are shown on the map: Penang, Langkawi, Port Klang, KLIA, Singapore.
- No invented prices, fleet numbers, tonnage, awards or phone numbers.
- The quote form is explicitly an enquiry, not a price generator ("No instant pricing is generated").
- The tracker does not return fake positions. It records the reference and routes the customer to the operations team.
- Distances on the map panel are computed straight-line from the real coordinates, and labelled as such.

---

## 2. Brand strategy

### 2.1 Typography

| Role | Typeface | Why |
|---|---|---|
| Display / headings, numerals | **Sora** (600-800) | A geometric sans with wide, confident letterforms and tight tracking at large sizes. It reads like painted hull lettering and port signage: bold, industrial, modern. Heavy weights give headlines authority without a serif's old-company feel. |
| Body, labels, UI | **Inter** (400-700) | Neutral, highly legible at small sizes, excellent tabular figures for coordinates, years and distances. It stays out of the way so the operational content leads. |

Craft details that carry the nautical-industrial tone:
- Small-caps style labels in Inter with wide tracking (`.16em-.24em`) echo container markings and chart annotations ("SEA · PORTS · MARINE", "STAGE 03", "04 / NETWORK").
- Section indices (`01 / HERITAGE` ... `09 / OFFICES`) behave like drawing-sheet numbers, reinforcing a documented, accountable operation.
- Headlines are written as plain statements ("Operational trust, stated plainly."), because the brief warns against corporate fluff.

### 2.2 Colour

Colours are named tokens in `:root` and nothing is hard-coded in components.

| Token | Value | Meaning |
|---|---|---|
| `--navy` | `#0B1F33` | Deep sea and night harbour. Primary dark surface and heading colour. Conveys scale, seriousness, stability. |
| `--navy-2` | `#153650` | Hover and layered surfaces on navy. |
| `--ocean` | `#176B87` | The working-water teal. Used for focus, links and scrollspy. A calmer secondary to the amber. |
| `--steel` | `#547184` | Quayside steel. Labels, indices and chart linework. |
| `--paper` | `#F5F6F3` | Warm off-white that feels like a chart or manifest, not clinical SaaS white. |
| `--accent` | `#D9822B` | Signal amber, like a buoy light or safety-marked container. The only warm colour, so it always means "act here" or "this is live" (CTAs, selected port, active stage, progress). |

Rationale:
- **Dark-to-light rhythm.** Navy sections (hero, maritime operations, network, final CTA) alternate with paper and white sections. This creates the feeling of moving between sea and shore and gives the long page a clear pace.
- **One accent.** Because amber is used sparingly and consistently, it works as a wayfinding signal: the eye is always drawn to the next action or the current state.
- **Photography is slightly desaturated** (`saturate(.88) contrast(1.03)`) and set under navy gradients so very different stock images read as one visual world.

### 2.3 Layout and imagery

- A 1200px grid (1320px on very wide screens) with generous gutters and a clear type scale.
- Real port and vessel photography, always with descriptive alt text. The Responsibility section uses an aerial of a planned container yard, because the copy is about consolidated loads and repeatable lanes.
- Line-art route graphics (the hero route, the final horizon and ship) are drawn in the same thin-stroke style as nautical charts, so illustration and content share one language.

---

## 3. Information architecture and user journey

```
Header (fixed): Brand | About · Services · Our Network · Industries · Insights | Track Shipment | Get a Quote
│
├─ HERO ............ promise + 2 CTAs + chain strip (VESSEL → PORT → CARGO → CUSTOMS → LAND → DESTINATION)
├─ STATS ........... 1978 · 6 companies · SEA·AIR·LAND · 5 locations
├─ 01 HERITAGE ..... timeline (1978 → group → last mile) + "Since 1978" panel listing the six companies
├─ 02 SERVICES ..... 7-capability explorer (list + detail panel)
├─ 03 MARITIME ..... 6-stage operational line + marine capability list
├─ 04 NETWORK ...... interactive chart: 5 ports, routes, facts, linked ports
├─ 05 MODES ........ Ocean / Air / Land explorer
├─ 06 QUOTE ........ enquiry form + shipment tracker
├─ 07 TRUST ........ quote + five operational statements
├─ 08 CARGO ........ three industry panels
├─ Responsibility .. sustainability points + image
├─ 09 OFFICES ...... office selector + detail
└─ FINAL CTA + FOOTER
```

Journey logic for an importer, exporter or shipping principal:
1. **Understand who they are** (hero, stats, heritage).
2. **See what they can do for me** (services, maritime, modes).
3. **Check they are where I need them** (network map, offices).
4. **Act** (quote, track). The conversion block comes after the visitor has evidence, but the header keeps "Get a Quote" and "Track Shipment" one click away from every position.
5. **Be reassured** (trust, cargo types, responsibility) and **contact** (offices, final CTA).

Both primary conversions repeat at the hero, header, mid-page (maritime, with a marine-specific CTA) and the closing banner.

---

## 4. UX and motion: what we built and why

Motion is used to explain the business, never as decoration. Each effect has a job, and everything is switched off for visitors who prefer reduced motion.

### 4.1 First impression (hero)
- **Line-by-line headline reveal** on a masked line, so the promise arrives with a deliberate rhythm instead of just appearing.
- **Slow photo settle plus scroll parallax**: depth that suggests a live port, and the hero content gently fades as the visitor leaves it.
- **A route draws itself with a small vessel sailing along it.** It previews the idea of the whole site (cargo moving along a route) before a word is read.
- The coordinate chip (`PENANG / MALAYSIA 05°24'N 100°21'E`) has a pulsing marker, a quiet "operations are live" cue.

### 4.2 Orientation and trust
- **Scroll-progress bar** and a **fixed header** with **scrollspy** underline: the visitor always knows where they are in a long page and can jump anywhere.
- **Count-up stats** make the group's credentials feel earned. The year counts up to 1978 rather than simply being printed.
- **Staggered reveals** pace dense content so it is read in order, avoiding the "wall of text" the brief warns about.
- **Heritage timeline** has a rail that fills as you read, with the current milestone highlighted in amber and the others dimmed, so the story has a direction.

### 4.3 Explaining capability through interaction
- **Services explorer** (7 capabilities): the left list is the table of contents, the right panel shows the selected capability with image, scope and the route it covers. On tablet and phone the detail opens **inline under the chosen service** (accordion) so a thumb never has to scroll far from what it tapped.
- **Operational line** (6 stages): animates once, left to right, with a glowing head, mirroring a vessel moving through the chain. It runs once so it explains and then gets out of the way.
- **Mode explorer** (Ocean / Air / Land): a sliding underline, image crossfade and staggered list make the switch feel physical. This answers the brief's "multimodal capability explorer".
- **Industries**: hover reveals the detail on desktop. On touch devices the text is always visible and the panels become a swipe rail.

### 4.4 The network map (the centrepiece)
The brief asks for a dynamic interactive route map. We rebuilt ours from **real Natural Earth coastlines** (public domain), projected and framed on Peninsular Malaysia and Singapore, because a hand-drawn map undermines a logistics brand's authority.

- Ports are selected from the map or the buttons. The selected route lights up while the others dim.
- A cargo marker travels Penang → Port Klang → Singapore along the primary route, and dashed lanes show the logistics connections.
- Labels sit in clean callout columns with leader lines, so nothing collides even though the ports are geographically close (Port Klang and KLIA are about 45 km apart).
- The side panel gives each location a description, services, **coordinates, straight-line distance from Penang HQ**, and clickable **linked ports**, so the map doubles as a navigation tool.
- Chart furniture (graticule, lat/long ticks, scale bar, north arrow) signals precision and professionalism.

### 4.5 Conversion
- **Quote form**: inline validation with a clear shake on missing fields, a loading state on submit, then a confirmation that restates the route and email so the user knows it registered.
- **Tracker**: loading state and an honest, actionable response (see honesty rules above).
- **Buttons**: sheen sweep and (on devices with a fine pointer) a slight magnetic pull on primary actions. They are subtle, tactile feedback that makes the amber actions feel responsive under the cursor.
- **Pointer glow** on key cards gives a premium, tactile surface without changing layout.

### 4.6 Ending
- A slow ship crossing the horizon in the final banner closes the page on the opening metaphor.

### 4.7 Motion rules we applied
- Durations: 250-500 ms for interface feedback, 0.9-1.3 s for entrances, and long ambient loops only for map and ship.
- Custom easing (`cubic-bezier(.16,.84,.3,1)`) so movement decelerates like a vessel coming alongside rather than a bouncy app.
- Only `transform`, `opacity` and `clip-path` are animated, so everything stays on the compositor.
- `prefers-reduced-motion` removes parallax, reveals, route drawing, ship and loops. The page stays complete and readable.
- No JavaScript? Content is visible, because hidden-until-revealed states only apply when JS is present.

---

## 5. Responsiveness

The brief demands flawless mobile and desktop behaviour. We verified 320, 390, 768, 820, 1024, 1280, 1440 and 1920 px with automated checks for horizontal overflow (zero at every width).

| Area | Desktop | Tablet / phone |
|---|---|---|
| Header | Full nav + track link + CTA | Animated hamburger to full-screen menu with staggered links, closes on Escape, safe-area and dynamic-viewport aware |
| Services | Sticky detail beside list | Detail opens inline beneath the selected item |
| Network map | Chart beside facts panel | Chart on top, larger label type, names only, facts below |
| Process line | Horizontal | Vertical rail with glowing head |
| Industries | Three panels, hover reveal | Swipeable snap rail, text always visible |
| Stats | 4 across | 2 x 2, with unbreakable figures scaled to fit |
| Forms | Two columns | Single column, 16px inputs so iOS does not zoom |
| Why TAS | Aligned 2-column grid | Single column |
| Touch | - | 44px tap targets, hover-only effects removed on `hover: none` |

---

## 6. Implementation

### 6.1 Stack and structure
Clean **HTML, CSS and vanilla JavaScript** with zero dependencies, as the brief permits. Reasons:
- Fast first paint (the whole app is ~190 KB before images) and nothing to break in a client demo.
- Easy for a client's team to read, host and extend.
- Free static hosting on Vercel, with GitHub as the source.

```
tas-group/
├─ index.html     semantic sections, ARIA roles, SVG map markup
├─ styles.css     tokens → base → components → motion layer → responsive refinements
├─ app.js         single IIFE, no globals
├─ server.js      tiny static server for local use
└─ docs/          this document
```

### 6.2 Key technical decisions
- **One scroll loop.** A single `requestAnimationFrame`-throttled handler drives the progress bar, header state, scrollspy, parallax and timeline fill. This avoids a pile of competing scroll listeners.
- **IntersectionObserver** for reveals, stat counters and the process line (each runs once). Staggering is calculated per sibling group.
- **Data-driven interactions.** Services, ports, modes and offices are plain data objects rendered by small functions, so content changes do not require touching logic.
- **Real geography.** Map land shapes were generated from Natural Earth GeoJSON, projected to the SVG viewBox and simplified. Port positions use real latitude and longitude, and distances use the haversine formula.
- **Accessibility.** Semantic landmarks, tab roles and `aria-expanded` on selectors, descriptive alt text, visible focus rings, sufficient contrast on both navy and paper, and the reduced-motion support described above.
- **Resilience.** Broken images fall back to an on-brand placeholder, form fields validate without a backend, and the layout never relies on hover.
- **Performance.** Below-fold images are lazy-loaded, fonts are preconnected, animations avoid layout-triggering properties.

### 6.3 Lessons and gotchas worth recording
- A browser's IntersectionObserver respects an element's own `clip-path`. A fully clipped element is never "intersecting", so a clip-path reveal on an observed element never fires. We reveal the inner image instead, and fade the wrapper.
- `padding: Y 0` shorthand on a container class silently removes its horizontal gutter. Use the explicit top and bottom properties.
- An unbreakable stat value ("SEA·AIR·LAND") can stretch a CSS grid column. Use `minmax(0, 1fr)` and scale the figure.

---

## 7. Client pitch value

How this design helps TAS win business and command authority:

1. **It shows the chain, not a brochure.** Competing forwarders list services. TAS's differentiator is accountability across every handoff, and the site makes that visible: the hero chain strip, the six-stage operational line and the "one chain of responsibility" copy all say the same thing.
2. **Heritage becomes proof.** The 1978 stevedoring story and the "waterfront is where we began" section turn age into operational credibility (people who have actually planned berthings), which is exactly what a principal or importer wants from a port-agency partner.
3. **It reads as modern without losing seriousness.** Real charts, precise numerals and restrained motion signal a technology-capable operator to executives, while navy and steel keep it grounded for conservative industrial buyers.
4. **Buyers can self-qualify in seconds.** The map, mode explorer and capability list answer "can you serve my lane, mode and cargo?" quickly, and Quote and Track are always one click away.
5. **Clear B2B conversion paths.** Quote (new business), Track (existing customers, which reduces status-chasing calls) and Contact by office, with a marine-specific CTA for agency and project-cargo buyers.
6. **Safe to show to executives.** Nothing is invented. The prototype states clearly where live data and pricing would plug in, so leadership sees a credible product direction, not a mock-up that over-promises.
7. **Ready to extend.** The structure maps directly onto real integrations: a rate engine behind the quote form, a tracking API behind the tracker, a CMS for news (the "Insights" anchor), and additional ports as the data object grows.

### Suggested next steps for a real engagement
- Connect quote and tracking to TAS's systems.
- Replace stock photography with TAS's own fleet, yard and team imagery.
- Add Malay and Chinese language versions for the regional customer base.
- Add a news and insights area for market updates and sustainability reporting.

---

## 8. Attributions

- Fonts: Sora and Inter via Google Fonts (SIL Open Font License).
- Map geometry: Natural Earth (public domain).
- Photography: Unsplash (free licence), used as prototype placeholders.
