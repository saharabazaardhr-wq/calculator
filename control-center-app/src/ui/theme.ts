import { Platform } from 'react-native';

/** Design tokens from the approved design samples (design/index.html). */
export const C = {
  bg: '#F5F5F7',
  card: '#FFFFFF',
  ink: '#1D1D1F',
  ink2: '#3A3A3C',
  muted: '#6E6E73',
  faint: '#AEAEB2',
  line: '#E8E8ED',
  green: '#1F7A4D',
  greenD: '#155C39',
  greenSoft: '#E9F4EE',
  greenMid: '#7BC29A',
  orange: '#F59E0B',
  amber: '#B45309',
  amberSoft: '#FEF4E4',
  red: '#D92D20',
  redSoft: '#FDEDEB',
  blue: '#2563EB',
  blueSoft: '#EAF1FE',
  greySoft: '#F2F2F5',
} as const;

export type Tone = 'ok' | 'warn' | 'bad' | 'mute' | 'info';
export const TONE: Record<Tone, { fg: string; bg: string }> = {
  ok: { fg: C.green, bg: C.greenSoft },
  warn: { fg: C.amber, bg: C.amberSoft },
  bad: { fg: C.red, bg: C.redSoft },
  mute: { fg: C.muted, bg: C.greySoft },
  info: { fg: C.blue, bg: C.blueSoft },
};

export const RADIUS = { card: 20, md: 14, sm: 12 } as const;

export const FONT = Platform.select({
  web: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
  default: undefined,
});

/** Screens wider than this get the sidebar layout (laptops, large tablets). */
export const WIDE = 900;
