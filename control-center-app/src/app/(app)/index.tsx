import { Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { addDays, fmtDay, fmtLongDate, fmtT, greeting, inr, today } from '../../lib/format';
import { canDecide, cashToRoom, isCashier, isWaiting, levelOf, needsOwner, personById, seesCash, shiftCalc, varianceBoard, visibleIds } from '../../lib/rules';
import { useMe, useStore } from '../../lib/store';
import type { Shift } from '../../lib/types';
import { RedShiftList, ShiftStatusPill } from '../../ui/cash';
import { Button, Card, CardHeader, Divider, Empty, Grid, PageHeader, Pill, Row, Screen, StatTile, Txt, useWide } from '../../ui/kit';
import { C } from '../../ui/theme';

const sales = (s: Shift) => Object.values(s.modes).reduce<number>((a, v) => a + (v ?? 0), 0);

export default function Home() {
  const me = useMe()!;
  const data = useStore();
  const wide = useWide();
  if (isCashier(me, data.roles)) return <Redirect href="/cash" />;

  const cs = data.cash.settings;
  const vis = visibleIds(data, me);
  const isOwner = levelOf(me, data.roles) === 'owner';
  const T = today();
  const mine = data.cash.shifts.filter((s) => vis.has(s.cashierId));
  const todays = mine.filter((s) => s.date === T);
  const closed = todays.filter((s) => s.status !== 'open');
  const waiting = mine.filter(isWaiting);
  const forMe = waiting
    .filter((s) => canDecide(data, me, s))
    .sort((a, b) => Number(needsOwner(b, cs)) - Number(needsOwner(a, cs)) || (a.submittedAt ?? 0) - (b.submittedAt ?? 0));
  const month = varianceBoard(data, vis, T.slice(0, 7));
  const repeat = month.filter((r) => r.reds >= cs.repeatRed);
  const week = Array.from({ length: 7 }, (_, i) => addDays(T, i - 6)).map((d) => ({
    d, v: mine.filter((s) => s.date === d && s.status !== 'open').reduce((a, s) => a + sales(s), 0),
  }));
  const max = Math.max(1, ...week.map((w) => w.v));
  const netToday = closed.reduce((a, s) => a + shiftCalc(s, cs).diff, 0);

  const hero = (
    <View style={st.hero}>
      <View style={st.heroGlow} />
      <Row style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Txt size={14} color="rgba(255,255,255,0.8)">Counter sales today · closed shifts</Txt>
          <Txt size={wide ? 46 : 38} weight="800" color="#fff" style={{ lineHeight: wide ? 56 : 46 }}>{inr(closed.reduce((a, s) => a + sales(s), 0))}</Txt>
        </View>
        {wide && seesCash(data, me) ? <Button label="Open Cash" kind="outline" icon="arrow" onPress={() => router.navigate('/cash')} /> : null}
      </Row>
      <View style={st.heroPill}><Txt size={13} weight="500" color="#fff">{closed.length} of {todays.length} shifts closed</Txt></View>
      <View style={st.mini}>
        {[
          [inr(netToday), 'Cash variance'],
          [inr(closed.reduce((a, s) => a + cashToRoom(s, cs), 0)), 'Cash to cash room'],
          [inr(closed.reduce((a, s) => a + (s.modes.upi ?? 0), 0)), 'UPI'],
          [inr(closed.reduce((a, s) => a + (s.modes.credit ?? 0), 0)), 'Credit given'],
        ].map(([v, l]) => (
          <View key={l} style={{ minWidth: 110 }}>
            <Txt size={20} weight="700" color="#fff">{v}</Txt>
            <Txt size={13} color="rgba(255,255,255,0.75)">{l}</Txt>
          </View>
        ))}
      </View>
    </View>
  );

  const tiles = (
    <Grid min={150}>
      <StatTile icon="cash" tone="bad" value={String(waiting.length)} label="Red shifts waiting" sub={forMe.length ? `${forMe.length} need${forMe.length === 1 ? 's' : ''} you` : 'None for you'} subTone={forMe.length ? 'bad' : undefined} />
      <StatTile icon="clock" tone="info" value={String(todays.filter((s) => s.status === 'open').length)} label="Counters open now" sub={`${cs.counters.length} counters`} />
      <StatTile icon="alert" tone="warn" value={String(repeat.length)} label="Repeat-red cashiers" sub={`${cs.repeatRed}+ reds this month`} subTone={repeat.length ? 'warn' : undefined} />
      <StatTile icon="chart" tone="ok" value={inr(month.reduce((a, r) => a + r.net, 0))} label="Variance this month" sub={`${month.reduce((a, r) => a + r.shifts, 0)} shifts`} />
    </Grid>
  );

  const decisions = (
    <View style={{ gap: 12 }}>
      <Row>
        <Txt size={17} weight="600" style={{ flex: 1 }}>Needs your decision</Txt>
        {forMe.length ? <Pill tone="bad" label={`${forMe.length} waiting`} /> : null}
      </Row>
      {forMe.length ? <RedShiftList shifts={forMe} compact /> : <Empty text="Nothing is waiting for you." />}
    </View>
  );

  const counters = (
    <Card>
      <CardHeader title="Counters right now" />
      {cs.counters.map((ctr, i) => {
        const last = todays.filter((s) => s.counter === ctr).sort((a, b) => b.openedAt - a.openedAt)[0];
        return (
          <View key={ctr}>
            {i > 0 ? <Divider /> : null}
            <Row style={{ paddingVertical: 11 }}>
              <View style={{ flex: 1 }}>
                <Txt weight="500">{ctr}</Txt>
                <Txt size={13} color={C.muted}>{last ? `${personById(data, last.cashierId)?.name.split(' ')[0]} · since ${fmtT(last.openedAt)}` : 'Not opened today'}</Txt>
              </View>
              {last ? <ShiftStatusPill s={last} /> : <Pill tone="mute" label="Closed" />}
            </Row>
          </View>
        );
      })}
    </Card>
  );

  const chart = (
    <Card>
      <CardHeader title="Counter sales this week" />
      <View style={st.strip}>
        {week.map((w, i) => (
          <View key={w.d} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={{ height: 70, justifyContent: 'flex-end', width: '100%' }}>
              <View style={{ height: Math.max(4, (w.v / max) * 70), borderRadius: 6, backgroundColor: i === 6 ? C.green : C.greenMid }} />
            </View>
            <Txt size={12} color={i === 6 ? C.green : C.faint} weight={i === 6 ? '600' : '400'}>{i === 6 ? 'Today' : fmtDay(w.d).slice(0, 3)}</Txt>
          </View>
        ))}
      </View>
    </Card>
  );

  return (
    <Screen>
      <PageHeader sub={fmtLongDate()} title={`${greeting()}, ${me.name.split(' ')[0]}`} />
      {wide ? (
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <View style={{ flex: 1, gap: 20 }}>{hero}{tiles}{decisions}</View>
          <View style={{ width: 320, gap: 20 }}>{counters}{chart}</View>
        </View>
      ) : (
        <View style={{ gap: 16 }}>{hero}{decisions}{tiles}{counters}{chart}</View>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  hero: { backgroundColor: C.green, borderRadius: 24, padding: 24, overflow: 'hidden' },
  heroGlow: { position: 'absolute', right: -60, top: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  mini: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  strip: { flexDirection: 'row', gap: 6 },
});

