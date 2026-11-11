import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { inr } from '../../../lib/format';
import { DENOMS, personById, redMessage, redRecipients, shiftCalc, shiftLabel } from '../../../lib/rules';
import { useMe, useStore } from '../../../lib/store';
import type { PayMode } from '../../../lib/types';
import { openWhatsApp } from '../../../lib/whatsapp';
import { Icon } from '../../../ui/Icon';
import { BigButton, Card, Choices, Divider, Grid, Hi, KeyValues, MoneyField, Row, Screen, StepsBar, Stepper, Txt } from '../../../ui/kit';
import { C } from '../../../ui/theme';

type Step = 'notes' | 'pos' | 'result' | 'done';

const MODES: [PayMode, string, string][] = [
  ['cash', 'Cash sales', 'नकद बिक्री'],
  ['upi', 'UPI', 'UPI'],
  ['card', 'Card', 'कार्ड'],
  ['sodexo', 'Sodexo', 'सोडेक्सो'],
  ['credit', 'Credit given', 'उधार'],
  ['lp', 'LP points', 'LP पॉइंट'],
];

export default function CloseShift() {
  const me = useMe()!;
  const data = useStore();
  const [shiftId] = useState(() => data.cash.shifts.find((s) => s.cashierId === me.id && s.status === 'open')?.id);
  const [step, setStep] = useState<Step>('notes');
  const s = data.cash.shifts.find((x) => x.id === shiftId);
  if (!s) return <Redirect href="/cash" />;

  const cs = data.cash.settings;
  const c = shiftCalc(s, cs);
  const setNote = (k: string, n: number) => data.patchShift(s.id, { notes: { ...s.notes, [k]: n } });
  const setMode = (k: PayMode, n: number | undefined) => data.patchShift(s.id, { modes: { ...s.modes, [k]: n } });
  const back = () => (step === 'notes' ? router.back() : setStep(step === 'pos' ? 'notes' : 'pos'));
  const doneCount = { notes: 2, pos: 3, result: 4, done: 5 }[step];

  const header = (
    <View style={{ marginBottom: 18 }}>
      <Row style={{ marginBottom: 14 }} gap={12}>
        {step !== 'done' ? (
          <Pressable onPress={back} accessibilityLabel="Back" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="back" />
          </Pressable>
        ) : null}
        <View>
          <Txt size={17} weight="600">Close shift</Txt>
          <Txt size={13} color={C.muted}>{shiftLabel(s)} · {me.name.split(' ')[0]}</Txt>
        </View>
      </Row>
      <StepsBar total={5} done={doneCount} redLast={c.red && (step === 'result' || step === 'done')} />
      <Txt size={13} color={C.muted} style={{ marginTop: 6 }}>
        {step === 'done' ? 'Shift locked' : `Step ${doneCount + 1 > 5 ? 5 : doneCount + 1} of 5 · ${{ notes: 'Count notes', pos: 'POS totals', result: 'Result', done: '' }[step]}`}
      </Txt>
    </View>
  );

  /* ---------- step 3: count notes ---------- */
  if (step === 'notes') {
    return (
      <Screen footer={
        <View style={{ gap: 12 }}>
          <Row><Txt color={C.muted} style={{ flex: 1 }}>Counted · गिना गया</Txt><Txt testID="counted" size={24} weight="700">{inr(c.counted)}</Txt></Row>
          <BigButton testID="next-pos" label="Next: POS totals" icon="arrow" disabled={c.counted <= 0} onPress={() => setStep('pos')} />
        </View>}>
        {header}
        <Txt size={26} weight="700">Count your notes</Txt>
        <Hi size={16}>अपने नोट गिनें</Hi>
        <Card pad={0} style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {DENOMS.map((d, i) => (
            <View key={d}>
              {i > 0 ? <Divider /> : null}
              <Row style={{ paddingVertical: 10 }} gap={12}>
                <Txt size={19} weight="700" style={{ width: 66 }}>₹{d}</Txt>
                <Txt size={13} color={C.muted} style={{ flex: 1 }}>{inr(d * (s.notes[String(d)] || 0))}</Txt>
                <Stepper testID={`note-${d}`} value={s.notes[String(d)] || 0} onChange={(n) => setNote(String(d), n)} />
              </Row>
            </View>
          ))}
          <Divider />
          <View style={{ paddingVertical: 12 }}>
            <MoneyField testID="coins" label="Coins (total)" hi="सिक्के" value={s.notes.coins || undefined} onChange={(n) => setNote('coins', n ?? 0)} />
          </View>
        </Card>
      </Screen>
    );
  }

  /* ---------- step 4: POS totals ---------- */
  if (step === 'pos') {
    return (
      <Screen footer={<BigButton testID="see-result" label="See result" hi="नतीजा देखें" icon="arrow" disabled={s.modes.cash === undefined} onPress={() => setStep('result')} />}>
        {header}
        <Txt size={26} weight="700">POS totals</Txt>
        <Hi size={16}>इस शिफ्ट का POS टोटल</Hi>
        <Txt color={C.muted} style={{ marginTop: 6, marginBottom: 16 }}>Copy these from the eFacto shift report. Once eFacto is connected they will fill in automatically.</Txt>
        <Grid min={150}>
          {MODES.map(([k, en, hi]) => (
            <MoneyField key={k} testID={`mode-${k}`} label={en + (k === 'cash' ? ' *' : '')} hi={hi} value={s.modes[k]} onChange={(n) => setMode(k, n)} />
          ))}
        </Grid>
      </Screen>
    );
  }

  /* ---------- step 5: result ---------- */
  if (step === 'result') {
    const short = c.diff < 0;
    return (
      <Screen footer={c.red ? (
        <BigButton testID="submit-shift" tone="red" icon="lock" label="Submit & tell supervisor" disabled={!s.reason} onPress={() => { data.submitShift(s.id); setStep('done'); }} />
      ) : (
        <BigButton testID="submit-shift" icon="lock" label="Submit & lock shift" hi="जमा करें" onPress={() => { data.submitShift(s.id); setStep('done'); }} />
      )}>
        {header}
        <View style={{ alignItems: 'center', paddingVertical: 8, gap: 6 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: c.red ? C.redSoft : C.greenSoft }}>
            <Icon name={c.red ? 'alert' : 'check'} size={38} color={c.red ? C.red : C.green} stroke={2.2} />
          </View>
          <Txt testID="result-amount" size={42} weight="800" color={c.red ? C.red : C.green} center>
            {c.red ? `${short ? 'Short' : 'Excess'} ${inr(Math.abs(c.diff))}` : 'All good'}
          </Txt>
          <Txt color={C.muted} center>
            {c.red ? `${short ? 'कैश कम है' : 'कैश ज़्यादा है'} · more than the ${inr(cs.tolerance)} allowed` : `Difference ${inr(c.diff)} · सब सही है`}
          </Txt>
        </View>
        <View style={{ marginTop: 16 }}>
          <KeyValues rows={[
            ['Expected', inr(c.expected)],
            ['Counted', inr(c.counted)],
            ...(c.red ? [] : ([['Hand over to next cashier', inr(Math.min(c.counted, cs.defaultFloat))], ['Cash to cash room', inr(Math.max(0, c.counted - cs.defaultFloat))]] as [string, string][])),
          ]} />
          <Txt size={13} color={C.muted} style={{ marginTop: 8 }}>
            Expected = float {inr(s.floatOpen)} + cash sales {inr(c.sales)} − cash out {inr(c.outs)}
          </Txt>
        </View>
        {c.red ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            <View><Txt weight="600">What happened?</Txt><Hi>क्या हुआ?</Hi></View>
            <Choices tone="red" options={cs.redReasons} value={s.reason} onChange={(r) => data.patchShift(s.id, { reason: r })} />
          </View>
        ) : null}
      </Screen>
    );
  }

  /* ---------- done ---------- */
  const people = redRecipients(data, s);
  return (
    <Screen footer={<BigButton testID="done" label="Done" hi="हो गया" onPress={() => (router.canGoBack() ? router.back() : router.replace('/cash'))} />}>
      {header}
      <View style={{ alignItems: 'center', gap: 8, paddingVertical: 16 }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: s.status === 'red' ? C.redSoft : C.greenSoft }}>
          <Icon name="lock" size={34} color={s.status === 'red' ? C.red : C.green} stroke={2.2} />
        </View>
        <Txt size={28} weight="800" center>Shift locked</Txt>
        <Txt color={C.muted} center>
          {s.status === 'red' ? `Red shift sent to ${people.map((p) => p.name.split(' ')[0]).join(' and ')} for a decision.` : 'Green. Nothing more to do. Thank you!'}
        </Txt>
      </View>
      {s.status === 'red' ? (
        <Card style={{ gap: 10 }}>
          <Txt weight="600">Tell them now on WhatsApp</Txt>
          <Txt size={13} color={C.muted}>Once the WhatsApp Business API is connected this happens automatically.</Txt>
          {people.map((p) => (
            <BigButton key={p.id} tone="white" icon="send" label={`Send to ${p.name}`} disabled={!p.phone} onPress={() => openWhatsApp(p.phone, redMessage(data, s))} />
          ))}
        </Card>
      ) : (
        <KeyValues rows={[['Hand over to next cashier', inr(s.handoverFloat ?? 0)], ['Cash to cash room', inr(Math.max(0, c.counted - (s.handoverFloat ?? 0)))], ['Cashier', personById(data, s.cashierId)?.name ?? '']]} />
      )}
    </Screen>
  );
}
