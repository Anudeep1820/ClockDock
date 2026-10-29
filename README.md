# ⏰ ClockDock — Premium StandBy Clock & Screensaver

A distraction-free bedside clock and screensaver inspired by iPhone StandBy mode, crafted with React, TypeScript, Vite, and Tailwind CSS.

---

### 🌐 Live Web App
👉 **[https://clockdock.vercel.app](https://clockdock.vercel.app)**

### 📱 Android App (Direct Download)
📥 **[Download ClockDock Android APK](https://clockdock.vercel.app/clockdock.apk)** *(v1.0 • 6.2 MB)*  
Or download directly from this repository: **[`public/clockdock.apk`](./public/clockdock.apk)**

---

## 📲 How to Install the APK on Your Android Phone (e.g. Oppo / ColorOS / Samsung / Pixel)

1. **Download:** Tap the download link above on your phone or transfer `public/clockdock.apk` to your phone via USB / Nearby Share / Google Drive.
2. **Open:** Tap `clockdock.apk` in your phone's notification bar or File Manager (`Downloads`).
3. **Allow Installation:** If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*, tap **Settings** and enable **"Allow from this source"**.
4. **Install & Enjoy:** Tap **Install**, then open ClockDock for a full-screen, native bedside StandBy clock experience!

---

## ✨ Features

- **Nine Handcrafted Clock Faces:**
  - 🕒 **StandBy Digital:** Large dual-tone numerals with soft breathing separator dots and date complication.
  - 🧭 **Minimal Analog:** Refined Bauhaus circular dial with continuous sub-second smooth sweeping second hand.
  - 🎴 **Retro Flip:** Tactile split-flap cards with realistic card shadows, divider lines, and 3D mechanical flip animations.
  - 🌌 **Ambient Glow:** Oversized typography with ethereal multi-layer luminous glow and atmospheric breathing aura.
  - ⚡ **Neon Cyber:** Futuristic numerals with vivid cyberpunk dual-color outlines and outer glow.
  - 📰 **Premium Editorial:** Sophisticated serif typography with high-contrast dates and editorial layout.
  - 🌈 **Aurora Digital:** Gradient-infused numerals inspired by northern lights with soft color shifts.
  - 🌍 **Modern World Clock:** Dual-time display showing primary local time alongside a selectable global capital city.
  - 🟢 **Matrix Minimal:** Retro-futuristic monospace terminal numerals with scanline aesthetics.

- **Clock Design Studio & Customization:**
  - **10 Animated Background Themes:** OLED Black, Deep Ocean, Midnight Nebula, Aurora Borealis, Sunset Horizon, Cosmic Night, Ambient Particles, Liquid Gradient, Soft Glow, and Custom Colors.
  - **7 Clock Color Accents:** Warm White, Crimson Red (0% blue light circadian mode), Sunset Amber, Electric Cyan, Mint Green, Lavender, and Golden Amber + Custom Hex/Gradients.
  - **Visual Preset Management:** Save, duplicate, rename, export/import custom presets as JSON.
  - **Cinematic Transitions:** Smooth crossfade, slide, and scale transitions.

- **Adaptive Sleep Mode & Smart Dock:**
  - Automated bedtime scheduling (daily or separate weekday/weekend hours).
  - Circadian dimming (0% blue light crimson tint, hidden seconds, dimmed OLED background).
  - Idle fade: Controls disappear after 3.5 seconds of inactivity and reappear upon touch/mouse movement.

- **Time Tools (Offline Web Audio Engine):**
  - **Bedside Alarms:** Configurable repeating alarms with synthesized multi-tone arpeggio chimes and snooze/dismiss overlay.
  - **Countdown Timer:** High-precision countdown with background time-catchup and completion bell.
  - **Stopwatch:** Millisecond-accurate stopwatch with lap tracking.

- **Live Weather Integration (Open-Meteo):**
  - Zero-config, privacy-friendly live temperature, high/low, and weather condition badges with offline caching.

- **Free Privacy-Respecting Visitor Analytics:**
  - Integrated with Vercel Web Analytics (cookie-free, GDPR-compliant aggregate traffic insights).

- **Multi-Platform Deployment:**
  - **Installable PWA:** Works offline with service-worker precaching on iOS Safari and Chrome.
  - **Native Android APK:** Packaged with Capacitor 6 for native Android bedside performance.

---

## ⌨️ Controls & Shortcuts

- **`Swipe Left / Right`**: Switch between clock faces
- **`1` – `4`**: Jump to specific clock face
- **`Space` or `Tap Clock`**: Cycle clock accent colors
- **`S`**: Open Settings Sheet
- **`N`**: Toggle Circadian Night Mode (Crimson)
- **`F`**: Toggle Fullscreen Mode
- **`R`**: Toggle 90° Landscape Mode

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Anudeep1820/ClockDock.git
cd ClockDock

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
