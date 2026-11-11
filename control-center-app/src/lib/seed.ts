/** Demo data so the app can be tried before real staff and eFacto data are connected. */
import { DENOMS } from './rules';
import { addDays, at, today, uid } from './format';
import type { CashSettings, Data, Person, Role, Shift } from './types';

export function defaultCashSettings(): CashSettings {
  return {
    tolerance: 50,
    ceiling: 1000,
    timeoutMin: 30,
    repeatRed: 3,
    defaultFloat: 5000,
    counters: ['Counter 1', 'Counter 2', 'Counter 3'],
    redReasons: [
      'Wrong change given / गलत छुट्टा दिया',
      'Credit not noted / उधार दर्ज नहीं',
      'Bill voided / बिल रद्द हुआ',
      'Wrong payment mode / भुगतान मोड गलत',
      "Don't know / पता नहीं",
    ],
    outReasons: ['Safe drop to cash room / कैश रूम में जमा', 'Change purchase / छुट्टा लिया', 'Petty expense / छोटा खर्च', 'Other / अन्य'],
  };
}

const ROLES: Role[] = [
  { id: 'r_owner', name: 'Owner', level: 'owner' },
  { id: 'r_bm', name: 'Business Manager', level: 'manager' },
  { id: 'r_sm', name: 'Store Manager', level: 'manager' },
  { id: 'r_cash', name: 'Cash Supervisor', level: 'manager' },
  { id: 'r_cashier', name: 'Cashier', level: 'staff', counter: true },
];

const P = (id: string, name: string, roleId: string, dept: string, managerId: string, phone: string, pin: string, shift = '09:00'): Person => ({
  id, name, roleId, dept, managerId, phone, pin, shift, active: true,
});

const PEOPLE: Person[] = [
  P('p_owner', 'Anil Yadav', 'r_owner', 'Management', '', '', '0000'),
  P('p_bm', 'Mohit', 'r_bm', 'Management', 'p_owner', '9800000020', '1111'),
  P('p_sm', 'Rakesh Sharma', 'r_sm', 'Management', 'p_bm', '9800000001', '0001'),
  P('p_cash', 'Meena Joshi', 'r_cash', 'Cash & Billing', 'p_bm', '9800000006', '0006', '13:30'),
  P('p_c1', 'Sneha Kulkarni', 'r_cashier', 'Cash & Billing', 'p_cash', '9800000010', '0010'),
  P('p_c2', 'Farhan Ali', 'r_cashier', 'Cash & Billing', 'p_cash', '9800000011', '0011', '14:00'),
  P('p_c3', 'Ravi Kumar', 'r_cashier', 'Cash & Billing', 'p_cash', '9800000012', '0012'),
];

export const DEMO_PINS = 'Anil 0000 · Mohit 1111 · Meena 0006 · Sneha 0010 · Ravi 0012';

function notesFor(amount: number): Record<string, number> {
  const n: Record<string, number> = {};
  let rem = Math.max(0, amount);
  for (const d of DENOMS) {
    n[String(d)] = Math.floor(rem / d);
    rem -= n[String(d)] * d;
  }
  n.coins = rem;
  return n;
}

export function seed(): Data {
  const cs = defaultCashSettings();
  const F = cs.defaultFloat;
  const T = today();
  const now = Date.now();
  let x = 20261111;
  const rnd = () => {
    x = (x + 0x6d2b79f5) | 0;
    let t = Math.imul(x ^ (x >>> 15), 1 | x);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const make = (date: string, counter: string, cashierId: string, open: string, closeMs: number | null, sales: number, diff: number, reason: string, accepted: boolean): Shift => {
    const openedAt = at(date, open);
    const drop = Math.floor((sales * 0.6) / 1000) * 1000;
    const counted = F + sales - drop + diff;
    const red = Math.abs(diff) > cs.tolerance;
    return {
      id: uid(), date, counter, cashierId, openedAt, floatOpen: F, floatExpected: F, floatOk: true,
      cashOuts: drop ? [{ amt: drop, reason: cs.outReasons[0], at: openedAt + 3 * 36e5 }] : [],
      notes: notesFor(counted),
      modes: { cash: sales, upi: Math.round(sales * 0.9), card: Math.round(sales * 0.3), sodexo: rnd() < 0.2 ? Math.round(rnd() * 600) : 0, credit: rnd() < 0.3 ? Math.round(rnd() * 900) : 0, lp: 0 },
      status: closeMs ? (red ? 'red' : 'green') : 'open',
      reason: red ? reason : '',
      submittedAt: closeMs ?? undefined,
      handoverFloat: F,
      review: closeMs && red ? (accepted ? { status: 'accepted', by: 'p_cash', at: closeMs + 35 * 60000, note: 'Checked bills' } : { status: 'pending' }) : null,
    };
  };

  const shifts: Shift[] = [];
  const plan: [string, string, string, string, number][] = [
    ['p_c1', 'Counter 1', '09:00', '14:05', 0.12],
    ['p_c2', 'Counter 1', '14:10', '22:15', 0.45],
    ['p_c3', 'Counter 2', '09:00', '17:05', 0.15],
  ];
  for (let i = 6; i >= 1; i--) {
    const date = addDays(T, -i);
    for (const [pid, ctr, o, c, weak] of plan) {
      const red = rnd() < weak;
      const sales = 18000 + Math.round(rnd() * 25000);
      const diff = red ? -(150 + Math.round(rnd() * 550)) : Math.round((rnd() - 0.5) * 60);
      shifts.push(make(date, ctr, pid, o, at(date, c), sales, diff, cs.redReasons[Math.floor(rnd() * 5)], true));
    }
  }
  if (now > at(T, '10:00')) {
    shifts.push(make(T, 'Counter 3', 'p_c2', '08:30', now - 12 * 60000, 31200, -1250, cs.redReasons[4], false));
    shifts.push(make(T, 'Counter 1', 'p_c1', '09:00', now - 20 * 60000, 21450, -320, cs.redReasons[0], false));
  }
  if (now > at(T, '09:00')) {
    const open = make(T, 'Counter 2', 'p_c3', '09:00', null, 0, 0, '', false);
    shifts.push({ ...open, notes: {}, modes: {}, cashOuts: [] });
  }

  return {
    company: { name: 'Sahara Bazaar' },
    roles: ROLES,
    people: PEOPLE,
    cash: { settings: cs, shifts },
    log: [],
  };
}
