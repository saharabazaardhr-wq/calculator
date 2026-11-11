export type Level = 'owner' | 'manager' | 'staff';

export type Role = {
  id: string;
  name: string;
  level: Level;
  /** Works a billing counter (sees the cashier screens). */
  counter?: boolean;
};

export type Person = {
  id: string;
  name: string;
  roleId: string;
  dept: string;
  managerId?: string;
  phone?: string;
  pin: string;
  shift?: string;
  active: boolean;
};

export type CashOut = { amt: number; reason: string; at: number };

export type ReviewStatus = 'pending' | 'review' | 'accepted';

export type Review = {
  status: ReviewStatus;
  by?: string;
  at?: number;
  note?: string;
  escalated?: boolean;
};

export type ShiftStatus = 'open' | 'green' | 'red';

export type Shift = {
  id: string;
  date: string; // YYYY-MM-DD
  counter: string;
  cashierId: string;
  openedAt: number;
  floatOpen: number;
  floatExpected: number;
  floatOk: boolean;
  cashOuts: CashOut[];
  /** Note counts keyed by denomination ("500"…"10"); "coins" holds a rupee amount. */
  notes: Record<string, number>;
  /** POS totals by payment mode, as entered (or imported from eFacto). */
  modes: Partial<Record<PayMode, number>>;
  status: ShiftStatus;
  reason: string;
  submittedAt?: number;
  handoverFloat?: number;
  review?: Review | null;
};

export type PayMode = 'cash' | 'upi' | 'card' | 'sodexo' | 'credit' | 'lp';

export type CashSettings = {
  tolerance: number;
  ceiling: number;
  timeoutMin: number;
  repeatRed: number;
  defaultFloat: number;
  counters: string[];
  redReasons: string[];
  outReasons: string[];
};

export type LogEntry = { at: number; by: string; action: string; detail: string };

export type Data = {
  company: { name: string };
  roles: Role[];
  people: Person[];
  cash: { settings: CashSettings; shifts: Shift[] };
  log: LogEntry[];
};
