/**
 * Business rules for Phase 1 (cash control). Pure functions: no UI, no storage,
 * so the same rules can run on the phone, the web and later in Supabase edge functions.
 */
import type { CashSettings, Data, Level, Person, Role, Shift } from './types';

export const DENOMS = [500, 200, 100, 50, 20, 10] as const;

/* ---------- people & access ---------- */
export const roleOf = (p: Person | undefined, roles: Role[]) => roles.find((r) => r.id === p?.roleId);
export const levelOf = (p: Person | undefined, roles: Role[]): Level => roleOf(p, roles)?.level ?? 'staff';
export const isCashier = (p: Person | undefined, roles: Role[]) => !!roleOf(p, roles)?.counter;
export const ownerOf = (d: Data) => d.people.find((p) => p.active && levelOf(p, d.roles) === 'owner');
export const personById = (d: Data, id?: string) => d.people.find((p) => p.id === id);

export function descendants(people: Person[], id: string): string[] {
  const out: string[] = [];
  const queue = [id];
  while (queue.length) {
    const x = queue.shift()!;
    for (const p of people) {
      if (p.active && p.managerId === x && p.id !== id && !out.includes(p.id)) {
        out.push(p.id);
        queue.push(p.id);
      }
    }
  }
  return out;
}

/** Who this person is allowed to see: owner sees all, a manager sees their team, staff see themselves. */
export function visibleIds(d: Data, me: Person): Set<string> {
  const lv = levelOf(me, d.roles);
  if (lv === 'owner') return new Set(d.people.filter((p) => p.active).map((p) => p.id));
  if (lv === 'manager') return new Set([me.id, ...descendants(d.people, me.id)]);
  return new Set([me.id]);
}

/** A manager or owner who has at least one cashier in their team (or is the owner). */
export function seesCash(d: Data, me: Person): boolean {
  if (levelOf(me, d.roles) === 'owner' || isCashier(me, d.roles)) return true;
  for (const id of visibleIds(d, me)) if (isCashier(personById(d, id), d.roles)) return true;
  return false;
}

/* ---------- shift maths ---------- */
export type ShiftCalc = { outs: number; sales: number; expected: number; counted: number; diff: number; red: boolean; ready: boolean };

export function shiftCalc(s: Shift, cs: CashSettings): ShiftCalc {
  const outs = s.cashOuts.reduce((a, o) => a + (o.amt || 0), 0);
  const sales = s.modes.cash ?? 0;
  const expected = (s.floatOpen || 0) + sales - outs;
  const counted = DENOMS.reduce((a, d) => a + d * (s.notes[String(d)] || 0), 0) + (s.notes.coins || 0);
  const diff = counted - expected;
  const ready = counted > 0 && s.modes.cash !== undefined;
  return { outs, sales, expected, counted, diff, red: Math.abs(diff) > cs.tolerance, ready };
}

export const shiftLabel = (s: Shift) => `${s.counter} · ${new Date(s.openedAt).getHours() < 14 ? 'Morning' : 'Evening'}`;

export function prevHandover(shifts: Shift[], counter: string, cs: CashSettings) {
  const last = shifts
    .filter((s) => s.counter === counter && s.status !== 'open')
    .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0))[0];
  return last ? { amt: last.handoverFloat ?? cs.defaultFloat, from: last.cashierId } : { amt: cs.defaultFloat, from: '' };
}

export const cashToRoom = (s: Shift, cs: CashSettings) => {
  const c = shiftCalc(s, cs);
  return c.outs + Math.max(0, c.counted - (s.handoverFloat ?? 0));
};

/* ---------- red shift decisions ---------- */
export function approverChain(d: Data, s: Shift): Person[] {
  const out: Person[] = [];
  let p = personById(d, personById(d, s.cashierId)?.managerId);
  while (p && !out.includes(p)) {
    out.push(p);
    p = personById(d, p.managerId);
  }
  return out;
}

export const isOverCeiling = (s: Shift, cs: CashSettings) => Math.abs(shiftCalc(s, cs).diff) > cs.ceiling;
export const minutesWaiting = (s: Shift) => (s.submittedAt ? (Date.now() - s.submittedAt) / 60000 : 0);

/** The owner must decide: above the rupee ceiling, escalated, or nobody decided within the timeout. */
export const needsOwner = (s: Shift, cs: CashSettings) =>
  isOverCeiling(s, cs) || !!s.review?.escalated || minutesWaiting(s) > cs.timeoutMin;

export function canDecide(d: Data, me: Person, s: Shift): boolean {
  if (levelOf(me, d.roles) === 'owner') return true;
  if (isOverCeiling(s, d.cash.settings) || s.review?.escalated) return false;
  return approverChain(d, s).some((p) => p.id === me.id);
}

/** Who should be told on WhatsApp about this red shift. */
export function redRecipients(d: Data, s: Shift): Person[] {
  const owner = ownerOf(d);
  if (needsOwner(s, d.cash.settings)) return owner ? [owner] : [];
  return approverChain(d, s).filter((p) => levelOf(p, d.roles) !== 'owner').slice(0, 2);
}

export const isWaiting = (s: Shift) => s.status === 'red' && !!s.review && s.review.status !== 'accepted';

export function redMessage(d: Data, s: Shift): string {
  const c = shiftCalc(s, d.cash.settings);
  const name = personById(d, s.cashierId)?.name ?? '';
  return [
    `🔴 RED SHIFT · ${d.company.name}`,
    `${shiftLabel(s)} · ${name}`,
    `${c.diff < 0 ? 'Short' : 'Excess'} ₹${Math.abs(Math.round(c.diff))} (expected ₹${Math.round(c.expected)}, counted ₹${Math.round(c.counted)})`,
    `Reason: ${s.reason}`,
    'Please Accept / Review / Escalate in Control Center.',
  ].join('\n');
}

/* ---------- variance board ---------- */
export type CashierMonth = { id: string; shifts: number; reds: number; net: number; short: number; credit: number; topReason?: string };

export function varianceBoard(d: Data, vis: Set<string>, month: string): CashierMonth[] {
  const rows = new Map<string, CashierMonth & { reasons: Record<string, number> }>();
  for (const s of d.cash.shifts) {
    if (s.status === 'open' || !s.date.startsWith(month) || !vis.has(s.cashierId)) continue;
    const r = rows.get(s.cashierId) ?? { id: s.cashierId, shifts: 0, reds: 0, net: 0, short: 0, credit: 0, reasons: {} };
    const diff = shiftCalc(s, d.cash.settings).diff;
    r.shifts++;
    r.net += diff;
    if (diff < 0) r.short -= diff;
    r.credit += s.modes.credit ?? 0;
    if (s.status === 'red') {
      r.reds++;
      r.reasons[s.reason] = (r.reasons[s.reason] ?? 0) + 1;
    }
    rows.set(s.cashierId, r);
  }
  return [...rows.values()]
    .map(({ reasons, ...r }) => ({ ...r, topReason: Object.entries(reasons).sort((a, b) => b[1] - a[1])[0]?.[0] }))
    .sort((a, b) => b.reds - a.reds || a.net - b.net);
}

/** Split "Wrong change given / गलत छुट्टा दिया" into English and Hindi parts. */
export function splitBilingual(s: string): [string, string] {
  const [en, hi] = s.split(' / ');
  return [en.trim(), (hi ?? '').trim()];
}
