# ☕ ServeJoy — Mobile-First Premium Café POS & Contactless QR Ordering SaaS

ServeJoy is a modern, offline-first café point-of-sale (POS), Kitchen Order Ticketing (KOT), and customer contactless table QR ordering system designed for Indian cafés, bakeries, and dining lounges.

Built with **React 18 + TypeScript + Vite + Tailwind CSS**, wrapped with **Capacitor** for Android/iOS, and powered by **Firebase Firestore Live Cloud Sync** and **Voice Soundbox Audio Announcements**.

---

## ✨ Features

- **Billing POS Terminal (`/`)**:
  - Quick menu search and category filtering (Snacks, Beverages, Desserts, Meals).
  - Cart sheet with real-time bill calculations, discounts, and item notes.
  - Payment modes: Dynamic UPI QR Code, Cash, and Card.
  - 58mm ESC-POS Bluetooth/USB Thermal Printer receipt formatting.
  - Direct WhatsApp receipt sharing (`wa.me`).
  - Table Standee 2D QR Code Generator (for printing acrylic table standees).
  - Real-time Sales Velocity Analytics (Revenue, Net Profit, Bestsellers, Hourly charts with Recharts).
- **Kitchen Order Tickets KOT (`/kitchen`)**:
  - Live kitchen orders queue (Pending ➔ Preparing ➔ Ready ➔ Served).
  - Elapsed timers with warning badges for delayed tickets.
  - Customer special chef instructions highlighted.
  - Audio chimes & TTS voice alerts when orders are punched or marked ready.
- **Waiter Service Screen (`/waiter`)**:
  - Fast table punch-in directly to the kitchen queue.
  - Live notifications for customer table calls (Water refill, Bill requested, Waiter assistance).
- **Contactless Customer QR Menu (`/menu/:cafeId?table=Table+2`)**:
  - Mobile web dining menu for customers scanning table QR standees with their phone camera.
  - No app download required.
  - Place order straight to kitchen and call waiter with one tap.
- **Voice Soundbox Synthesizer**:
  - Automatic voice announcements for incoming cloud orders, ready kitchen tickets, and received UPI payments.
- **AI Menu Item Creator**:
  - Auto-match gourmet dish photography.
  - Google Gemini API integration for sensory culinary dish copywriting.
- **Offline-First with Cloud Sync**:
  - LocalStorage caching for instant, zero-latency offline billing.
  - Real-time bidirectional polling & sync with Firebase Firestore (`servejoy-pos-live`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **State & Data**: React Context API, TanStack React Query, LocalStorage
- **Charts & Feedback**: Recharts, Sonner (Toast notifications)
- **Cloud Database**: Firebase Firestore REST API (`servejoy-pos-live`)
- **Native Android Wrapper**: Capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📱 Building the Android APK with Capacitor

```bash
# Sync web dist to Android native project
npx cap sync android

# Open in Android Studio to build APK
npx cap open android
```

---

## 🔐 Default Credentials

- **Terminal Unlock PIN**: `1234`
- **Owner Account**: `siddhant@chaipoint.com`
- **Default Sample Café**: Chai Point, Bengaluru

