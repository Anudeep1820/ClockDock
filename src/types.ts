export type ClockFace =
  | 'standby-dual'      // Dual widgets (Clock + Music/Calendar like iOS StandBy)
  | 'big-bold'          // Huge digits across room (Image 1, 2, 3)
  | 'retro-flip'        // Classic mechanical flip clock (Image 1)
  | 'minimal-analog'    // Swiss Bauhaus dial with smooth sweep (Image 4, 5)
  | 'neon-slice'        // Angled high-contrast split (Image 1)
  | 'night-glow'        // Atmospheric night date clock (Image 1)
  | 'botanical-zen';    // Soft organic sage aesthetic

export type WidgetType =
  | 'clock-digital'
  | 'clock-analog'
  | 'music'
  | 'calendar'
  | 'weather'
  | 'sleep-sounds'
  | 'battery'
  | 'quotes';

export type NightTint =
  | 'crimson'
  | 'teal'
  | 'mint'
  | 'amber'
  | 'orange'
  | 'moonlight'
  | 'lime';

export interface ColorPalette {
  id: string;
  name: string;
  hours: string;
  minutes: string;
  accent: string;
  badgeBg: string;
}

export interface SoundTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number; // in seconds
  color: string;
}

export interface AlarmItem {
  id: string;
  time: string; // HH:mm
  label: string;
  enabled: boolean;
  days: string[];
}
