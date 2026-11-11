import { Redirect } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { fmtDT } from '../../lib/format';
import { levelOf, personById, roleOf } from '../../lib/rules';
import { useMe, useStore } from '../../lib/store';
import type { CashSettings } from '../../lib/types';
import { Avatar, BigButton, Button, Card, CardHeader, Divider, Grid, MoneyField, PageHeader, Pill, Row, Screen, TextField, Txt } from '../../ui/kit';
import { C } from '../../ui/theme';

type NumKey = 'tolerance' | 'ceiling' | 'timeoutMin' | 'repeatRed' | 'defaultFloat';
const FIELDS: [NumKey, string, string][] = [
  ['tolerance', 'Cash tolerance ± (green/red)', 'छूट'],
  ['ceiling', 'Red-shift ceiling (above → owner)', 'सीमा'],
  ['defaultFloat', 'Counter float', 'फ्लोट'],
  ['timeoutMin', 'Minutes before owner is alerted', 'मिनट'],
  ['repeatRed', 'Repeat-red flag (reds / month)', 'बार'],
];

export default function Settings() {
  const me = useMe()!;
  const data = useStore();
  const [form, setForm] = useState<CashSettings>(data.cash.settings);
  const [counters, setCounters] = useState(data.cash.settings.counters.join(', '));
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  if (levelOf(me, data.roles) !== 'owner') return <Redirect href="/" />;

  const save = () => {
    const list = counters.split(',').map((x) => x.trim()).filter(Boolean);
    data.saveSettings({ ...form, counters: list.length ? list : form.counters });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Screen>
      <PageHeader title="Settings" sub="Owner only" />

      <Card style={{ gap: 16 }}>
        <CardHeader title="Money limits & rules" right={saved ? <Pill tone="ok" label="Saved" /> : undefined} />
        <Grid min={220}>
          {FIELDS.map(([k, label, hi]) => (
            <MoneyField key={k} testID={`set-${k}`} label={label} hi={hi} value={form[k]} onChange={(n) => setForm({ ...form, [k]: n ?? 0 })} />
          ))}
        </Grid>
        <View style={{ gap: 6 }}>
          <Txt size={14} weight="500" color={C.ink2}>Counters (comma separated)</Txt>
          <TextField value={counters} onChange={setCounters} />
        </View>
        <View style={{ maxWidth: 320 }}><BigButton testID="save-settings" label="Save rules" onPress={save} /></View>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <CardHeader title="Team & PINs" />
        {data.people.map((p, i) => (
          <View key={p.id}>
            {i > 0 ? <Divider /> : null}
            <Row style={{ paddingVertical: 10 }} gap={12}>
              <Avatar name={p.name} />
              <View style={{ flex: 1 }}>
                <Txt weight="600">{p.name}</Txt>
                <Txt size={13} color={C.muted}>{roleOf(p, data.roles)?.name} · reports to {personById(data, p.managerId)?.name ?? '—'}</Txt>
              </View>
              <Pill tone="mute" label="PIN set" />
            </Row>
          </View>
        ))}
        <Txt size={13} color={C.muted} style={{ marginTop: 8 }}>Adding and editing staff arrives with the Team screen in the next step.</Txt>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <CardHeader title="Activity log" />
        {data.log.length ? data.log.slice(0, 40).map((l, i) => (
          <View key={i}>
            {i > 0 ? <Divider /> : null}
            <Row style={{ paddingVertical: 9, alignItems: 'flex-start' }} gap={12}>
              <Txt size={13} color={C.muted} style={{ width: 120 }}>{fmtDT(l.at)}</Txt>
              <View style={{ flex: 1 }}>
                <Txt size={14} weight="500">{l.action}</Txt>
                <Txt size={13} color={C.muted}>{personById(data, l.by)?.name}{l.detail ? ` · ${l.detail}` : ''}</Txt>
              </View>
            </Row>
          </View>
        )) : <Txt color={C.muted}>No activity yet.</Txt>}
      </Card>

      <Card style={{ marginTop: 20, gap: 10 }}>
        <CardHeader title="Demo data" />
        <Txt color={C.muted}>The app is running with sample data on this device. Reloading replaces every shift and the log.</Txt>
        <Row>
          <Button kind="danger" label={confirmReset ? 'Tap again to confirm' : 'Reload demo data'} onPress={() => {
            if (!confirmReset) return setConfirmReset(true);
            data.resetDemo();
            setForm(useStore.getState().cash.settings);
            setConfirmReset(false);
          }} />
        </Row>
      </Card>
    </Screen>
  );
}
