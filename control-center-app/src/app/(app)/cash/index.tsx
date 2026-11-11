import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { fmtLongDate, fmtT, inr, today } from '../../../lib/format';
import { cashToRoom, isCashier, isWaiting, needsOwner, personById, prevHandover, shiftCalc, shiftLabel, splitBilingual, varianceBoard, visibleIds } from '../../../lib/rules';
import { useMe, useStore } from '../../../lib/store';
import { RedShiftList, ShiftList } from '../../../ui/cash';
import {
  BigButton, Button, Card, CardHeader, Choices, Divider, Empty, Grid, Hi, IconBadge, MoneyField, PageHeader, Pill, Row, Screen, StatTile, StepsBar, Txt,
} from '../../../ui/kit';
import { C } from '../../../ui/theme';

export default function Cash() {
  const me = useMe()!;
  const roles = useStore((s) => s.roles);
  return isCashier(me, roles) ? <CashierCounter /> : <CashBoard />;
}

/* ================= Cashier ================= */
function CashierCounter() {
  const me = useMe()!;
  const shifts = useStore((s) => s.cash.shifts);
  const open = shifts.find((s) => s.cashierId === me.id && s.status === 'open');
  const recent = shifts.filter((s) => s.cashierId === me.id && s.status !== 'open').sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0)).slice(0, 7);
  return open ? <MyShift id={open.id} recent={recent} /> : <StartShift recent={recent} />;
}

function StartShift({ recent }: { recent: ReturnType<typeof useStore.getState>['cash']['shifts'] }) {
  const me = useMe()!;
  const data = useStore();
  const cs = data.cash.settings;
  const busy = new Set(data.cash.shifts.filter((s) => s.status === 'open').map((s) => s.counter));
  const free = cs.counters.filter((c) => !busy.has(c));
  const [counter, setCounter] = useState(free[0] ?? '');
  const ho = prevHandover(data.cash.shifts, counter, cs);
  const [float, setFloat] = useState<number | undefined>(undefined);
  const value = float ?? ho.amt;

  return (
    <Screen
      footer={free.length ? (
        <BigButton testID="start-shift" label="Confirm float & start" hi="शुरू करें" icon="check" disabled={!counter}
          onPress={() => { data.startShift(counter, value); setFloat(undefined); }} />
      ) : undefined}>
      <PageHeader sub={fmtLongDate()} title={`Hello, ${me.name.split(' ')[0]}`} />
      <StepsBar total={5} done={0} />
      <Txt size={13} color={C.muted} style={{ marginTop: 6, marginBottom: 16 }}>Step 1 of 5 · Start shift</Txt>
      {!free.length ? (
        <Empty text="All counters have an open shift." />
      ) : (
        <View style={{ gap: 16 }}>
          <View>
            <Txt size={24} weight="700">Which counter?</Txt>
            <Hi size={15}>कौन सा काउंटर?</Hi>
          </View>
          <Choices options={free} value={counter} onChange={(c) => { setCounter(c); setFloat(undefined); }} cols={3} />
          <Card style={{ gap: 14 }}>
            <View>
              <Txt weight="600">Count the cash in the drawer</Txt>
              <Hi>दराज़ में कैश गिनें</Hi>
              <Txt size={13} color={C.muted} style={{ marginTop: 4 }}>
                Handed over: {inr(ho.amt)}{ho.from ? ` by ${personById(data, ho.from)?.name}` : ''}
              </Txt>
            </View>
            <MoneyField testID="float" label="Float in drawer" hi="फ्लोट" value={value} onChange={setFloat} />
            {value !== ho.amt ? <Pill tone="warn" label={`Different from ${inr(ho.amt)}: supervisor will see this`} /> : <Pill tone="ok" label="Matches the handover" />}
          </Card>
        </View>
      )}
      {recent.length ? <Card style={{ marginTop: 20 }}><CardHeader title="My recent shifts" /><ShiftList shifts={recent} showDate hideName /></Card> : null}
    </Screen>
  );
}

function MyShift({ id, recent }: { id: string; recent: ReturnType<typeof useStore.getState>['cash']['shifts'] }) {
  const data = useStore();
  const s = data.cash.shifts.find((x) => x.id === id)!;
  const cs = data.cash.settings;
  const [amt, setAmt] = useState<number | undefined>(undefined);
  const [reason, setReason] = useState(cs.outReasons[0]);

  return (
    <Screen footer={<BigButton testID="close-shift" label="Close shift" hi="शिफ्ट बंद करें" icon="lock" onPress={() => router.push('/cash/close')} />}>
      <PageHeader sub={fmtLongDate()} title={shiftLabel(s)} right={<Pill tone="info" label="In progress" />} />
      <Card style={{ gap: 4 }}>
        <Txt color={C.muted}>Started {fmtT(s.openedAt)}</Txt>
        <Row><Txt weight="600" style={{ flex: 1 }}>Opening float</Txt><Txt weight="700">{inr(s.floatOpen)}</Txt></Row>
        {!s.floatOk ? <Pill tone="warn" label={`Handed over ${inr(s.floatExpected)}: mismatch noted`} /> : null}
      </Card>

      <Card style={{ marginTop: 16, gap: 14 }}>
        <View>
          <Txt size={17} weight="600">Cash taken out</Txt>
          <Hi>शिफ्ट के दौरान कैश निकासी</Hi>
        </View>
        {s.cashOuts.length ? (
          <View>
            {s.cashOuts.map((o, i) => (
              <View key={i}>
                {i > 0 ? <Divider /> : null}
                <Row style={{ paddingVertical: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Txt>{splitBilingual(o.reason)[0]}</Txt>
                    <Txt size={13} color={C.muted}>{fmtT(o.at)}</Txt>
                  </View>
                  <Txt weight="700">{inr(o.amt)}</Txt>
                </Row>
              </View>
            ))}
          </View>
        ) : <Txt color={C.muted}>Nothing taken out yet.</Txt>}
        <Divider />
        <MoneyField testID="cashout-amt" label="Amount" hi="रकम" value={amt} onChange={setAmt} />
        <Choices options={cs.outReasons} value={reason} onChange={setReason} />
        <Button testID="cashout-add" label="Add cash out" kind="dark" icon="plus" disabled={!amt} onPress={() => { if (amt) { data.addCashOut(id, amt, reason); setAmt(undefined); } }} />
      </Card>

      {recent.length ? <Card style={{ marginTop: 16 }}><CardHeader title="My recent shifts" /><ShiftList shifts={recent} showDate hideName /></Card> : null}
    </Screen>
  );
}

/* ================= Supervisor / manager / owner ================= */
function CashBoard() {
  const me = useMe()!;
  const data = useStore();
  const cs = data.cash.settings;
  const T = today();
  const vis = useMemo(() => visibleIds(data, me), [data, me]);
  const mine = data.cash.shifts.filter((s) => vis.has(s.cashierId));
  const todays = mine.filter((s) => s.date === T).sort((a, b) => a.openedAt - b.openedAt);
  const closed = todays.filter((s) => s.status !== 'open');
  const waiting = mine.filter(isWaiting).sort((a, b) => Number(needsOwner(b, cs)) - Number(needsOwner(a, cs)) || (a.submittedAt ?? 0) - (b.submittedAt ?? 0));
  const board = varianceBoard(data, vis, T.slice(0, 7));
  const earlier = mine.filter((s) => s.date !== T && s.status !== 'open').sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0)).slice(0, 20);

  return (
    <Screen>
      <PageHeader sub={fmtLongDate()} title="Cash counters" />
      <Grid min={150}>
        <StatTile icon="alert" tone="bad" value={String(waiting.length)} label="Red shifts waiting" />
        <StatTile icon="check" tone="ok" value={`${closed.length}/${todays.length}`} label="Shifts closed today" />
        <StatTile icon="chart" tone="info" value={inr(closed.reduce((a, s) => a + shiftCalc(s, cs).diff, 0))} label="Net variance today" />
        <StatTile icon="box" tone="mute" value={inr(closed.reduce((a, s) => a + cashToRoom(s, cs), 0))} label="Cash to cash room" />
      </Grid>

      <Row style={{ marginTop: 24, marginBottom: 12 }}>
        <Txt size={17} weight="600" style={{ flex: 1 }}>Red shifts: decision needed</Txt>
        {waiting.length ? <Pill tone="bad" label={String(waiting.length)} /> : null}
      </Row>
      {waiting.length ? <RedShiftList shifts={waiting} /> : <Empty text="No red shift waiting." />}

      <Card style={{ marginTop: 20 }}>
        <CardHeader title="Today's shifts" />
        <ShiftList shifts={todays} empty="No shift opened yet today." />
        {closed.length ? (
          <Txt size={13} color={C.muted} style={{ marginTop: 8 }}>
            By mode: Cash {inr(closed.reduce((a, s) => a + (s.modes.cash ?? 0), 0))} · UPI {inr(closed.reduce((a, s) => a + (s.modes.upi ?? 0), 0))} · Card {inr(closed.reduce((a, s) => a + (s.modes.card ?? 0), 0))} · Credit {inr(closed.reduce((a, s) => a + (s.modes.credit ?? 0), 0))}
          </Txt>
        ) : null}
      </Card>

      <Card style={{ marginTop: 20 }}>
        <CardHeader title="Variance board · this month" />
        {board.length ? board.map((r, i) => (
          <View key={r.id}>
            {i > 0 ? <Divider /> : null}
            <Row style={{ paddingVertical: 12, flexWrap: 'wrap' }} gap={12}>
              <IconBadge name="users" tone={r.reds >= cs.repeatRed ? 'bad' : 'mute'} size={40} />
              <View style={{ flex: 1, minWidth: 160 }}>
                <Txt weight="600">{personById(data, r.id)?.name}</Txt>
                <Txt size={13} color={C.muted}>{r.shifts} shifts · short {inr(r.short)} · credit {inr(r.credit)}{r.topReason ? ` · mostly “${splitBilingual(r.topReason)[0]}”` : ''}</Txt>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Txt weight="700" color={r.net < 0 ? C.red : C.green}>{inr(r.net)}</Txt>
                {r.reds >= cs.repeatRed ? <Pill tone="bad" label={`${r.reds} reds · repeat`} /> : <Pill tone={r.reds ? 'warn' : 'ok'} label={`${r.reds} red`} />}
              </View>
            </Row>
          </View>
        )) : <Txt color={C.muted}>No closed shifts this month.</Txt>}
        <Txt size={13} color={C.muted} style={{ marginTop: 10 }}>Patterns only. Any conversation with a cashier stays with the manager and owner, after hearing the person.</Txt>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <CardHeader title="Earlier shifts" />
        <ShiftList shifts={earlier} showDate />
      </Card>
    </Screen>
  );
}

