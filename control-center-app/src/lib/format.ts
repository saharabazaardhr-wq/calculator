const pad = (n: number) => String(n).padStart(2, '0');

/** Indian digit grouping (1,23,456) without relying on Intl, so it is identical on every device. */
function group(n: number): string {
  const s = String(Math.abs(Math.round(n)));
  if (s.length <= 3) return s;
  return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3);
}

export const inr = (n: number) => (n < 0 ? '−' : '') + '₹' + group(n || 0);
export const signedInr = (n: number) => (n > 0 ? '+' : '') + inr(n);

export const dstr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => dstr(new Date());
export const addDays = (s: string, n: number) => {
  const d = new Date(s + 'T00:00');
  d.setDate(d.getDate() + n);
  return dstr(d);
};
export const at = (date: string, time: string) => new Date(`${date}T${time}`).getTime();

export function fmtT(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  return `${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? 'am' : 'pm'}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const fmtDay = (s: string) => {
  const d = new Date(s + 'T00:00');
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const fmtLongDate = (d = new Date()) => `${DAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
export const fmtDT = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${fmtT(ms)}`;
};

export function ago(ms: number): string {
  const m = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ${m % 60} m ago`;
  return `${Math.floor(h / 24)} d ago`;
}

export const greeting = (d = new Date()) => (d.getHours() < 12 ? 'Good morning' : d.getHours() < 17 ? 'Good afternoon' : 'Good evening');

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
