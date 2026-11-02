# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary User**: Café Owners & Counter Cashiers running high-frequency food & beverage businesses (cafés, tea bars, bakeries, quick-service eateries, dining lounges). Needs rapid 1-click billing, instant UPI QR generation, 58mm thermal slip printing, and real-time sales summaries.
- **Secondary Users**:
  - **Waiters**: Table management, floor punch-ins, live notifications for table assistance (water refill, bill requests).
  - **Kitchen Chefs**: KOT live queue management, order elapsed timers, customer special chef notes, audio chime alerts.
  - **Dine-In Customers**: Contactless digital menu browsing and direct-to-kitchen ordering via table QR standees without app installation.

## Product Purpose

ServeJoy delivers a zero-latency, offline-first mobile café point-of-sale (POS), Kitchen Order Ticketing (KOT), and contactless QR ordering system designed specifically for Indian food & beverage businesses. Success means a cashier can complete an order, print an itemized bill with a dynamic UPI QR code, and be ready for the next customer in under 3 seconds, keeping queues moving during rush hours even with intermittent connectivity.

## Positioning

Unlike legacy POS software that requires cumbersome desktop setups, expensive proprietary hardware, or cloud-only systems that freeze when internet drops, ServeJoy provides:
- **Instant Client-First Speed**: Instant offline-first localStorage caching backed by real-time cloud sync with Firebase Firestore.
- **1-Click Bill & Dynamic UPI QR**: Seamless bill creation with itemized 58mm thermal printing and an embedded dynamic UPI QR code (PhonePe, GPay, Paytm) for immediate customer scan-and-pay.
- **Built-in Voice Soundbox**: Real-time audio chimes and voice announcements for orders, ready tickets, and payments without dedicated bank soundbox devices.
- **Unified 7-Screen Mobile Experience**: Seamless access across Home POS, Waiter, Kitchen KOT, Live Orders, Menu Manager, Business Insights, and Bills History.

## Operating Context

- Fast-paced, noisy café counters with impatient customer queues.
- Hands that may be wet or greasy quickly tapping touchscreens, mobile phones, tablets, or desktop cash registers.
- Direct hardware integration with ESC-POS 58mm/80mm Bluetooth & USB thermal printers and cash drawers.
- Physical dining tables equipped with acrylic 2D QR standees.
- Unreliable or fluctuating cellular/Wi-Fi connections requiring infallible offline operation.

## Capabilities and Constraints

- **Capabilities**:
  - Menu search, quick category filtering, and responsive dish card grid.
  - Collapsible Today's Summary card with sales velocity, net profit, and 1-tap WhatsApp sharing.
  - Visual Floor Plan with section filters (Indoor, Outdoor, AC) and active table order timers.
  - Floating cart FAB with badge counter, flying dish animation, and slide-over order drawer.
  - KOT workflow: Pending ➔ Preparing ➔ Ready ➔ Served with warning timer badges.
  - Direct WhatsApp receipt dispatch (`wa.me`) and 58mm ESC-POS printer formatted receipts.
  - Built-in Voice Soundbox synthesizer with bilingual announcement options (`hi-IN`, `en-IN`).
  - Contactless customer QR dining experience (`/menu/:cafeId?table=Table+2`).
  - AI Menu Dish Assistant powered by Google Gemini API.
- **Constraints**:
  - Thermal printing format constrained to 32 characters per line (58mm monochrome rolls).
  - Touch target discipline: high-frequency actions (+/-, Add, Bill & Pay) must maintain >= 44x44px hitboxes.
  - Fluid responsiveness: must look natural on compact 360px phones up to ultrawide 1720px+ cash counter monitors without dead margins.

## Brand Commitments

- **Name**: ServeJoy (Default Café: Chai Point Bengaluru, Siddhant).
- **Aesthetic**: Rich espresso header (`#221008`), warm primary orange accents (`#f97316` / `#ea580c`), soft clean neutral background, crisp borders, and appetizing gourmet dish imagery.
- **Typography**: Plus Jakarta Sans / Outfit for friendly modern headings, DM Sans for legible body text, JetBrains Mono for monetary figures, bill numbers, and KOT codes.
- **Voice & Tone**: Welcoming, energetic, efficient, and professional.

## Evidence on Hand

- **Repository**: `P:\antigravity-ide\scratch\ServeJoy`
- **Live Deployment**: `https://servejoy-pos-live.web.app` (Firebase project: `servejoy-pos-live`)
- **Git Remote**: `https://github.com/siddhant846/ServeJoy`
- **Gourmet Assets**: Authentic Indian café dish photography and sample catalog in `public/assets/` (Pav Bhaji, Dal Batti, Chole Puri, Dhokla, Chai, etc.) with real Indian Rupee (₹) pricing.

## Product Principles

1. **Zero-Friction Counter Speed**: Every primary cashier action (search, quantity change, bill generation) takes 1–2 taps maximum with zero lag.
2. **Offline-First Resilience**: Transactions, bill generation, and kitchen ticketing always work without network dependency, syncing automatically when connection restores.
3. **Scanability at a Glance**: Order cards, bill totals, and table states must be readable across the counter in high-stress, noisy environments.
4. **Effortless Contactless Payments**: Dynamic UPI QR codes embedded directly on bills and screens eliminate manual payment entry and reconciliation friction.
5. **Fluid Multi-Form Factor Polish**: A unified interface that feels native on handheld smartphones, tablets, and desktop displays without wasted space.

## Accessibility & Inclusion

- High-contrast text on all primary call-to-action buttons (white text on solid espresso brown and vibrant orange).
- Tactile hit targets >= 44px on all quantity buttons and primary touch controls.
- Audible text-to-speech soundbox cues (in English and Hindi) for order punching and payments in noisy commercial kitchens.

