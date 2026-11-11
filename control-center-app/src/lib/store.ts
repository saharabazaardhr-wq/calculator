/**
 * App state. Saved on the device (works offline) through AsyncStorage.
 * Every write goes through an action here, so the next step (syncing to Supabase)
 * only has to change this file, not the screens.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { today, uid } from './format';
import { prevHandover, shiftCalc, shiftLabel } from './rules';
import { seed } from './seed';
import type { CashSettings, Data, Person, Shift } from './types';

type Actions = {
  signIn: (id: string, pin: string) => boolean;
  signOut: () => void;
  startShift: (counter: string, float: number) => string;
  addCashOut: (id: string, amt: number, reason: string) => void;
  patchShift: (id: string, patch: Partial<Pick<Shift, 'notes' | 'modes' | 'reason'>>) => void;
  submitShift: (id: string) => 'green' | 'red';
  acceptRed: (id: string, note: string) => void;
  reviewRed: (id: string, note: string) => void;
  escalateRed: (id: string) => void;
  saveSettings: (s: Partial<CashSettings>) => void;
  resetDemo: () => void;
};

type State = Data & { userId: string | null; hydrated: boolean } & Actions;

const who = (s: Data, id?: string) => s.people.find((p) => p.id === id)?.name ?? '';

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const log = (action: string, detail = '') =>
        set((s) => ({ log: [{ at: Date.now(), by: s.userId ?? '', action, detail }, ...s.log].slice(0, 500) }));
      const updateShift = (id: string, fn: (sh: Shift) => Shift) =>
        set((s) => ({ cash: { ...s.cash, shifts: s.cash.shifts.map((x) => (x.id === id ? fn(x) : x)) } }));
      const shift = (id: string) => get().cash.shifts.find((x) => x.id === id)!;

      return {
        ...seed(),
        userId: null,
        hydrated: false,

        signIn: (id, pin) => {
          const p = get().people.find((x) => x.id === id && x.active);
          if (!p || p.pin !== pin) return false;
          set({ userId: id });
          log('Signed in');
          return true;
        },
        signOut: () => {
          log('Locked');
          set({ userId: null });
        },

        startShift: (counter, float) => {
          const s = get();
          const ho = prevHandover(s.cash.shifts, counter, s.cash.settings);
          const sh: Shift = {
            id: uid(), date: today(), counter, cashierId: s.userId!, openedAt: Date.now(),
            floatOpen: float, floatExpected: ho.amt, floatOk: float === ho.amt,
            cashOuts: [], notes: {}, modes: {}, status: 'open', reason: '', review: null,
          };
          set((st) => ({ cash: { ...st.cash, shifts: [...st.cash.shifts, sh] } }));
          log('Shift started', `${counter}, float ₹${float}${sh.floatOk ? '' : ` (handed over ₹${ho.amt})`}`);
          return sh.id;
        },
        addCashOut: (id, amt, reason) => {
          updateShift(id, (sh) => ({ ...sh, cashOuts: [...sh.cashOuts, { amt, reason, at: Date.now() }] }));
          log('Cash out', `${shift(id).counter}, ₹${amt}, ${reason}`);
        },
        patchShift: (id, patch) => updateShift(id, (sh) => ({ ...sh, ...patch })),

        submitShift: (id) => {
          const cs = get().cash.settings;
          const c = shiftCalc(shift(id), cs);
          updateShift(id, (sh) => ({
            ...sh,
            status: c.red ? 'red' : 'green',
            reason: c.red ? sh.reason : '',
            submittedAt: Date.now(),
            handoverFloat: Math.min(c.counted, cs.defaultFloat),
            review: c.red ? { status: 'pending' } : null,
          }));
          const sh = shift(id);
          log(c.red ? 'Red shift submitted' : 'Shift closed green', `${shiftLabel(sh)}, ${who(get(), sh.cashierId)}, ₹${Math.round(c.diff)}`);
          return c.red ? 'red' : 'green';
        },

        acceptRed: (id, note) => {
          updateShift(id, (sh) => ({ ...sh, review: { ...(sh.review ?? { status: 'pending' }), status: 'accepted', by: get().userId!, at: Date.now(), note } }));
          const sh = shift(id);
          log('Red shift accepted', `${shiftLabel(sh)}, ${who(get(), sh.cashierId)}${note ? ', ' + note : ''}`);
        },
        reviewRed: (id, note) => {
          updateShift(id, (sh) => ({ ...sh, review: { ...(sh.review ?? { status: 'pending' }), status: 'review', by: get().userId!, at: Date.now(), note } }));
          log('Red shift under review', `${shiftLabel(shift(id))}, ${note}`);
        },
        escalateRed: (id) => {
          updateShift(id, (sh) => ({ ...sh, review: { ...(sh.review ?? { status: 'pending' }), escalated: true } }));
          const sh = shift(id);
          log('Red shift escalated to owner', `${shiftLabel(sh)}, ${who(get(), sh.cashierId)}`);
        },

        saveSettings: (patch) => {
          set((s) => ({ cash: { ...s.cash, settings: { ...s.cash.settings, ...patch } } }));
          const cs = get().cash.settings;
          log('Rules changed', `tolerance ±₹${cs.tolerance}, ceiling ₹${cs.ceiling}, timeout ${cs.timeoutMin} min`);
        },
        resetDemo: () => set({ ...seed(), userId: get().userId }),
      };
    },
    {
      name: 'control-center-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ company: s.company, roles: s.roles, people: s.people, cash: s.cash, log: s.log, userId: s.userId }),
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    },
  ),
);

/** The signed-in person (undefined when locked). */
export const useMe = (): Person | undefined => useStore((s) => s.people.find((p) => p.id === s.userId));
