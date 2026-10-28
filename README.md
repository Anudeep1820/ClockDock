# ⏰ ClockDock — Premium StandBy Clock & Screensaver

A distraction-free bedside clock and screensaver inspired by iPhone StandBy mode, crafted with React, TypeScript, Vite, and Tailwind CSS.

---

## ✨ Features

- **Four Handcrafted Clock Faces:**
  - 🕒 **StandBy Digital:** Large dual-tone numerals with soft breathing separator dots and date complication. High-contrast readability across a bedroom.
  - 🧭 **Minimal Analog:** Refined Bauhaus circular dial with continuous sub-second smooth sweeping second hand and date complication at 3 o'clock.
  - 🎴 **Retro Flip:** Tactile split-flap cards with realistic card shadows, divider lines, and 3D mechanical flip card animations.
  - 🌌 **Ambient Glow:** Oversized typography with ethereal multi-layer luminous glow and atmospheric breathing aura.

- **Atmospheric Visual Customization:**
  - **7 Background Themes:** OLED Black (`#000000`), Midnight Blue, Deep Purple, Forest Green, Sunset Gradient, Warm Ember, and Aurora.
  - **7 Clock Color Accents:** Warm White, Crimson Red (0% blue light circadian mode), Sunset Amber, Electric Cyan, Mint Green, Lavender, and Golden Amber.
  - **5 Distinct Typography Styles:** Modern Sans (`Outfit`), Mono Geometry (`DM Mono`), Space Grotesk, Futuristic Cyber (`Chakra Petch`), and Editorial Serif (`Playfair Display`).
  - **Display Toggles:** 12H / 24H format, Show/Hide Date, Show/Hide Seconds.
  - **Bedside Screen Dimmer:** Smooth visual brightness slider (15% to 100%).
  - **90° Landscape Dock Mode:** Toggle for bedside charging stands.
  - **Instant Preview & Persistence:** Live updates persisted to `localStorage` with a 1-click "Restore Defaults" button.

- **Immersive StandBy Bedside Mode:**
  - Built with `100dvh` and `100dvw` viewport bounds.
  - Controls automatically fade after 3.5 seconds of inactivity. Tapping or moving reveals controls.
  - Horizontal touch swipe gestures to switch between clock faces.
  - Screen Wake Lock API keeps bedside display on while charging.
  - One-tap Fullscreen mode.
  - Progressive Web App (PWA) with standalone home-screen installation on iPhone and Android.

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
