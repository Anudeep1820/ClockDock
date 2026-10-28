import { ColorPalette, NightTint } from '../types';

export const PALETTES: ColorPalette[] = [
  {
    id: 'standby-pink-yellow',
    name: 'StandBy Sunset',
    hours: '#F472B6', // Soft coral pink
    minutes: '#FEF08A', // Pale creamy yellow
    accent: '#F43F5E',
    badgeBg: 'bg-rose-950/60 text-rose-200 border-rose-800/40',
  },
  {
    id: 'cyber-magenta',
    name: 'Neon Magenta',
    hours: '#EC4899', // Hot Pink
    minutes: '#F43F5E', // Rose
    accent: '#EC4899',
    badgeBg: 'bg-pink-950/60 text-pink-200 border-pink-800/40',
  },
  {
    id: 'electric-cyan',
    name: 'Electric Cyan',
    hours: '#38BDF8', // Cyan
    minutes: '#60A5FA', // Azure
    accent: '#06B6D4',
    badgeBg: 'bg-cyan-950/60 text-cyan-200 border-cyan-800/40',
  },
  {
    id: 'mint-sage',
    name: 'Olive & Mint',
    hours: '#A3E635', // Lime
    minutes: '#4ADE80', // Mint green
    accent: '#84CC16',
    badgeBg: 'bg-emerald-950/60 text-emerald-200 border-emerald-800/40',
  },
  {
    id: 'deep-purple',
    name: 'Midnight Plum',
    hours: '#C084FC', // Lavender
    minutes: '#E879F9', // Orchid
    accent: '#A855F7',
    badgeBg: 'bg-purple-950/60 text-purple-200 border-purple-800/40',
  },
  {
    id: 'amber-glow',
    name: 'Golden Amber',
    hours: '#FBBF24', // Amber
    minutes: '#F97316', // Orange
    accent: '#F59E0B',
    badgeBg: 'bg-amber-950/60 text-amber-200 border-amber-800/40',
  },
  {
    id: 'pure-white',
    name: 'Minimal White',
    hours: '#F8FAFC',
    minutes: '#CBD5E1',
    accent: '#FFFFFF',
    badgeBg: 'bg-zinc-800/60 text-zinc-200 border-zinc-700/40',
  },
];

export const NIGHT_TINTS: { id: NightTint; name: string; hex: string; glow: string; label: string }[] = [
  { id: 'crimson', name: 'Crimson Red', hex: '#EF4444', glow: 'rgba(239,68,68,0.5)', label: 'Circadian 0% Blue Light' },
  { id: 'teal', name: 'Cool Teal', hex: '#06B6D4', glow: 'rgba(6,182,212,0.5)', label: 'Calm Night' },
  { id: 'mint', name: 'Mint Green', hex: '#10B981', glow: 'rgba(16,185,129,0.5)', label: 'Soft Green' },
  { id: 'amber', name: 'Sunset Amber', hex: '#F59E0B', glow: 'rgba(245,158,11,0.5)', label: 'Warm Glow' },
  { id: 'orange', name: 'Ember Orange', hex: '#F97316', glow: 'rgba(249,115,22,0.5)', label: 'Firelight' },
  { id: 'moonlight', name: 'Moonlight', hex: '#E2E8F0', glow: 'rgba(226,232,240,0.4)', label: 'Pure Dim' },
  { id: 'lime', name: 'Night Lime', hex: '#84CC16', glow: 'rgba(132,204,22,0.5)', label: 'Radioactive Glow' },
];
