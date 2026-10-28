# ⏰ ClockDock — Smart Bedside & StandBy Clock

A sleek, responsive, and customizable bedside clock web application inspired by iOS 17 StandBy Mode, smart charging docks, and minimalist bedside displays.

![ClockDock Banner](https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&h=400&fit=crop)

## ✨ Features

- 📱 **Pair Any Two Widgets (Duo StandBy Mode)**
  - Dual-pane customizable dock view matching iOS StandBy
  - Select widgets for Left and Right slots: Digital Clock, Analog Swiss Dial, Music Player, Calendar & Agenda, Bedside Weather, Sleep Sound Machine, Power/Battery dock
  - Quick swap button between left and right slots

- 🕐 **Multiple Clock Faces**
  - **Duo Widgets**: Side-by-side widgets with auto-scaling
  - **Big Bold**: Ultra-high-contrast digits readable from across the room with dual-tone coloring
  - **Retro Flip Clock**: Mechanical flip-board split cards with 3D depth
  - **Minimal Analog Dial**: Smooth-sweeping chronometer with date complication and Bauhaus styling
  - **Neon Slice**: Cyberpunk angled split numerals with vivid neon glow
  - **Night Glow**: Deep dark mode with day, night period, and astronomical date readout

- 🌙 **Circadian Night Mode & Tint Swatches**
  - OLED pure black backgrounds with true 0% blue-light red spectrum mode
  - 7 luminous tint swatches: Crimson Red, Cool Teal, Mint Green, Sunset Amber, Ember Orange, Moonlight White, Night Lime
  - Screen dimmer brightness slider (15% to 100%) for pitch-black bedrooms

- 🎵 **Interactive Bedside Music Player**
  - Track artwork, artist info, seeking scrubber, and animated sound visualizer
  - Real-time chill lofi chord generator via Web Audio API

- 🌧️ **Ambient Sleep Sound Generator**
  - Synthetic Web Audio sleep sounds: Gentle Rain, Ocean Waves, Night Campfire, White Noise
  - Zero external sound downloads required — works 100% offline!

- ⚡ **Charging Dock & Power Status**
  - Real browser Battery API integration displaying live battery percentage, charging rate, and MagSafe animation

- ⏰ **Bedside Alarms**
  - Custom wakeup times with soothing synthesized audio chimes

- 🖥️ **Dock Immersion**
  - Fullscreen one-tap toggle (`F` key)
  - Screen Wake Lock API (keeps screen awake while placed on charging dock)
  - Auto-hiding dock controls on idle for complete bedroom serenity

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

## ⌨️ Keyboard Shortcuts

- `1` - `6`: Switch clock styles
- `N`: Toggle Night Mode
- `F`: Toggle Fullscreen
- `Space`: Play / Pause Lofi sound
