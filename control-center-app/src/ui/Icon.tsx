import Svg, { Path } from 'react-native-svg';
import { C } from './theme';

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const PATHS = {
  home: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z'],
  cash: ['M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z', circle(12, 12, 2.5), 'M6 12h.01M18 12h.01'],
  gear: [circle(12, 12, 3), 'M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1'],
  check: ['M20 6 9 17l-5-5'],
  clock: [circle(12, 12, 9), 'M12 7v5l3 2'],
  alert: [circle(12, 12, 9), 'M12 8v4M12 16h.01'],
  back: ['m15 18-6-6 6-6'],
  arrow: ['M5 12h14M12 5l7 7-7 7'],
  lock: ['M6 11h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', circle(9, 7, 4), 'M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'],
  inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'],
  chart: ['M3 3v18h18', 'M7 16v-4M12 16V8M17 16v-7'],
  send: ['m22 2-7 20-4-9-9-4z', 'M22 2 11 13'],
  delete: ['M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z', 'm18 9-6 6M12 9l6 6'],
  box: ['M21 8 12 3 3 8v8l9 5 9-5z', 'M3 8l9 5 9-5M12 13v8'],
  list: ['m3 7 2 2 4-4M3 17l2 2 4-4M13 6h8M13 12h8M13 18h8'],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, color = C.ink2, stroke = 1.8 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name].map((d, i) => (
        <Path key={i} d={d} />
      ))}
    </Svg>
  );
}
