---
name: ServeJoy
description: Mobile-first café POS, live kitchen ticketing, and dynamic UPI QR ordering design system.
colors:
  roasted-espresso: "#221008"
  spiced-saffron: "#ea580c"
  saffron-glow: "#f97316"
  warm-cream: "#faf7f2"
  card-white: "#ffffff"
  cardamom-truffle: "#291a13"
  muted-cinnamon: "#857065"
  warm-border: "#e8dfd8"
  emerald-veg: "#16a34a"
  ruby-nonveg: "#dc2626"
typography:
  display:
    fontFamily: "Outfit, Plus Jakarta Sans, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Outfit, Plus Jakarta Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, DM Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0em"
  body:
    fontFamily: "DM Sans, Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.spiced-saffron}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.lg}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.saffron-glow}"
  button-espresso:
    backgroundColor: "{colors.roasted-espresso}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  stepper-button:
    backgroundColor: "{colors.spiced-saffron}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.full}"
    size: "36px"
  cart-fab:
    backgroundColor: "{colors.spiced-saffron}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.full}"
    size: "56px"
  card-dish:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.cardamom-truffle}"
    rounded: "{rounded.xl}"
    padding: "14px"
  chip-category-active:
    backgroundColor: "{colors.spiced-saffron}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.full}"
    padding: "8px 18px"
  chip-category-inactive:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.cardamom-truffle}"
    rounded: "{rounded.full}"
    padding: "8px 18px"
---

# Design System: ServeJoy

## Overview

**Creative North Star: "The Artisan Espresso Counter"**

ServeJoy marries the warm, sensory atmosphere of a boutique artisanal café with the uncompromising velocity of a high-volume quick-service restaurant terminal. Built from the counter outward, every screen prioritizes split-second scanability, ergonomic fingertip tapping, and reassuring visual feedback. The interface rests on a soothing warm cream canvas, anchored by deep roasted-espresso top navigation bars and ignited by vivid saffron-orange call-to-actions that direct the cashier’s attention instantly during rush-hour order rushes.

We explicitly reject the sterile, cold corporate tech-blue tables, dense gray spreadsheets, and clinical utilitarian aesthetics of legacy desktop POS software. Likewise, we steer clear of distracting neon cyberpunk gradients and harsh pitch-black drop shadows that erode warmth. Instead, ServeJoy feels welcoming, tactile, and delicious: rich dish photography takes center stage, pill buttons invite immediate physical interaction, and ambient coffee-tinted drop shadows ground cards naturally in space.

**Key Characteristics:**
- **Counter Velocity**: 1-click workflows with zero latency; high-frequency modifiers (quantity steppers, table pills, bill punch) are tuned for rapid one-handed touch.
- **Warm Culinary Palette**: Roasted espresso brown (`#221008`) provides authority and contrast; spiced saffron (`#ea580c`) guides user action; warm cream (`#faf7f2`) prevents eye fatigue.
- **Tactile Soft Geometry**: Generous pill borders (`9999px`) and smooth card curvatures (`24px`) create a friendly, approachable touch environment.
- **Organic Depth**: Gentle warm shadows infused with roasted coffee undertones replace synthetic gray drop shadows.

## Colors

The palette balances warm culinary hospitality with high-visibility operational contrast.

### Primary
- **Roasted Espresso** (`#221008`): Deep roasted coffee brown used for the persistent mobile header, owner branding, status badges, and terminal authority containers.
- **Spiced Saffron** (`#ea580c`): Vibrant culinary orange that signals interactive energy; applied to primary CTA buttons ("Bill & Pay"), floating cart FAB, quantity steppers, and active navigation indicators.

### Secondary
- **Saffron Glow** (`#f97316`): Warm orange gradient partner used alongside Spiced Saffron for dynamic button gradients, active filter badges, and glow rings on focused inputs.

### Neutral
- **Warm Cream Canvas** (`#faf7f2`): Soft, warm off-white canvas that gives the application an organic, paper-like foundation without the harsh glare of `#FFFFFF`.
- **Card White** (`#ffffff`): Pure white used on elevated surface containers, dish cards, modal sheets, and dropdowns to achieve crisp layer separation.
- **Cardamom Truffle** (`#291a13`): Deep warm espresso charcoal used for high-contrast typography, prices, and headings.
- **Muted Cinnamon** (`#857065`): Soft brownish-gray for secondary dish descriptions, helper labels, timestamps, and placeholder copy.
- **Warm Border** (`#e8dfd8`): Delicate 1px structural dividing lines and card outlines that delineate layout regions without adding visual noise.

### Semantic
- **Emerald Veg** (`#16a34a`): Pure culinary green for vegetarian dish badges, successful transaction toasts, and settled bills.
- **Ruby Non-Veg** (`#dc2626`): Deep culinary crimson for non-vegetarian dish indicators, destructive actions (void/delete), and kitchen rush alerts.

### Named Rules
**The Saffron Action Rule.** Vivid Spiced Saffron (`#ea580c`) is reserved exclusively for forward purchasing actions, affirmative selections, and active states (Cart FAB, Add to Order, Bill & Pay, Active Tab/Table). It must never be diluted on decorative borders, passive icons, or neutral badges.

**The Espresso Anchor Rule.** High-density headers, terminal badges, and primary app shells use Roasted Espresso (`#221008`) to anchor the eye and establish operational authority.

## Typography

**Display Font:** Outfit (with fallback to Plus Jakarta Sans, sans-serif)  
**Body Font:** DM Sans / Plus Jakarta Sans (with fallback to sans-serif)  
**Label/Mono Font:** JetBrains Mono (with fallback to monospace)

**Character:** A harmonious pairing of Outfit's warm geometric roundness for headings with DM Sans's crisp horizontal tracking and high-legibility numerals for dense menu lists and cash receipts.

### Hierarchy
- **Display** (Bold 700, 2rem / 32px, line-height 1.2, letter-spacing -0.02em): Top-level café branding, hero sales totals in daily summaries, and receipt headers.
- **Headline** (SemiBold 600, 1.5rem / 24px, line-height 1.25, letter-spacing -0.01em): Section titles, drawer headers ("Current Order"), and table selection headings.
- **Title** (SemiBold 600, 1.125rem / 18px, line-height 1.35): Dish names on cards, order line item titles, and modal dialog titles.
- **Body** (Regular 400, 0.875rem / 14px, line-height 1.5): Dish ingredients and sensory descriptions, table notes, and customer special instructions.
- **Label** (SemiBold 600, 0.75rem / 12px, letter-spacing 0.02em, uppercase where tagged): Category badges ("SNACKS", "BEVERAGES"), PRO subscription pill, and order status flags.

### Named Rules
**The Monetary Monospace Rule.** All currency totals (₹), bill numbers, KOT ticket identifiers, and kitchen order timers must render in tabular JetBrains Mono to ensure effortless vertical alignment across receipts and ledger lines.

## Layout

The layout uses a fluid container expanding up to `max-w-[1720px]` with responsive multi-column scaling:
- **Mobile Handheld (360px–639px)**: 2-column dish card grid (`grid-cols-2`), compact header, full-width search bar, sticky bottom navigation bar (64px height), and elevated floating cart FAB (`bottom-24`).
- **Tablet & POS Terminal (640px–1023px)**: 3 to 4-column dish grid (`sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`), spacious category carousel, and comfortable counter spacing.
- **Widescreen Cash Register (1024px–1720px+)**: 5 to 6-column fluid responsive grid (`xl:grid-cols-5 2xl:grid-cols-6`), edge-to-edge breathing room with `px-3.5 sm:px-6 lg:px-10`, eliminating vacant margins while maintaining comfortable card proportions.
- **Bottom Clearance**: All scrollable page views strictly maintain `pb-28` to `pb-36` padding so content is never obscured by the bottom navigation bar or floating action buttons.

## Elevation & Depth

ServeJoy uses warm tonal layering and roasted-coffee ambient drop shadows. Surfaces rest quietly at rest and lift dynamically on hover or active engagement.

### Shadow Vocabulary
- **Card Ambient** (`box-shadow: 0 4px 18px -2px rgba(50, 36, 27, 0.05)`): Gentle warmth under resting dish cards, filter containers, and summary widgets.
- **Elevated Hover** (`box-shadow: 0 14px 38px -6px rgba(50, 36, 27, 0.12)`): Smooth lift applied to interactive dish cards on desktop hover.
- **Floating Cart FAB** (`box-shadow: 0 12px 28px rgba(234, 88, 12, 0.4)`): High-intensity saffron glow ensuring the cart trigger remains unmistakably discoverable on top of any page content.
- **Bottom Bar & Modals** (`box-shadow: 0 -4px 24px rgba(34, 16, 8, 0.06)`): Soft upward ambient elevation separating fixed chrome from scrollable canvases.

### Named Rules
**The Ambient Shadow Rule.** Cards and containers never use harsh black drop shadows. All shadows are tinted with roasted coffee undertones (`rgba(50, 36, 27, ...)`) to preserve warm organic atmosphere.

## Shapes

- **Pill Philosophy**: High-touch controls, filter categories, table pills, and primary buttons use full pill geometry (`rounded-full` / `9999px`) to invite confident, forgiving touch targeting.
- **Card Curvature**: Dish cards and container widgets use generous 24px corner curves (`rounded-3xl` / `1.5rem`), creating a soft organic boundary.
- **Modals & Drawers**: Slide-over order sheets and bottom sheets feature large 24px–32px top corner radii for a friendly mobile sheet aesthetic.
- **Crisp Hairline Boundaries**: Subtle 1px warm borders (`#e8dfd8`) provide structural clarity without visual heaviness.

## Components

### Buttons
- **Shape:** Full pill (`rounded-full`) for steppers and chips; 16px radius (`rounded-2xl`) for wide terminal action buttons.
- **Primary ("Bill & Pay"):** Linear gradient (`from-[#ea580c] to-[#f97316]`), bright white bold text (`#ffffff`), 14px padding, high tactile contrast.
- **Secondary ("Punch KOT"):** Warm stone/neutral cream background (`#f3eee9`), dark cardamom text (`#291a13`), subtle hover darkening.
- **Quantity Steppers:** 36px circular pill with bold white `-` and `+` icons, centered quantity numeral with smooth pop animation on change.

### Chips & Category Pills
- **Style:** Pill shape (`rounded-full`), smooth 8px vertical and 18px horizontal padding.
- **Active State:** Linear gradient (`from-[#ea580c] to-[#f97316]`), white text, soft drop shadow.
- **Inactive State:** Pure white background, subtle 1px border (`#e8dfd8`), warm dark text (`#291a13`), hover transition.

### Cards / Containers
- **Corner Style:** Smooth 24px curves (`rounded-3xl`).
- **Background:** Crisp Card White (`#ffffff`) resting on Warm Cream Canvas (`#faf7f2`).
- **Internal Padding:** 12px to 16px for dish cards; 18px to 24px for summary cards and modal drawers.
- **Border:** 1px hairline border in Warm Border (`#e8dfd8`).

### Inputs / Search Fields
- **Style:** 12px–16px rounded pill container, Card White background, subtle border, magnifying glass icon.
- **Focus:** Warm Saffron Glow (`border-color: #ea580c; box-shadow: 0 0 0 3.5px rgba(234, 88, 12, 0.18)`).

### Navigation
- **Header:** Rich Roasted Espresso (`#221008`) sticky header with coffee cup logo, café title, PRO status pill, and glass-morphism utility pills (`bg-white/10`).
- **Bottom Navigation Bar:** 7 persistent tabs (`Home`, `Waiter`, `Kitchen`, `Orders`, `Add`, `Insights`, `History`) with 64px height, backdrop blur (`bg-white/95`), active saffron indicator, and numeric notification badges.

### Signature Component: Floating Cart FAB & Flying Trajectory
- Floating 56px orange action button fixed at `bottom-24` and `right-6`, elevated at `z-50`.
- Includes a live badge counter with pulse animation (`badge-pulse`).
- Tapping dish `+` triggers a cloned flying dish thumbnail that arcs from the tapped card straight into the floating cart target with cubic-bezier timing (`flying-cart-item`).

## Do's and Don'ts

### Do:
- **Do** maintain a minimum 44x44px touch hitbox on all quantity modifiers, stepper buttons, and bill triggers.
- **Do** render all currency amounts in Indian Rupees (`₹`) accompanied by tabular JetBrains Mono font formatting.
- **Do** keep bottom clearance (`pb-28` to `pb-36`) across all scroll views so persistent navigation chrome never occludes interactive content.
- **Do** tint drop shadows with warm roasted espresso undertones (`rgba(50, 36, 27, ...)`) instead of raw black or gray.
- **Do** preserve the 7-screen mobile bottom navigation bar across all screen viewports.

### Don't:
- **Don't** use cold corporate blue, harsh gray spreadsheets, or clinical enterprise tables.
- **Don't** apply Spiced Saffron (`#ea580c`) to non-interactive decorative elements or secondary background containers.
- **Don't** hide or obscure the floating cart button behind bottom navigation chrome on any screen size.
- **Don't** allow long page margins or empty blank side gutters on widescreen displays; scale the grid smoothly up to 6 columns.
- **Don't** block counter operations with network loaders; maintain zero-latency local-first UI updates.

