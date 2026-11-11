/** Cash pieces shared by Home and the Cash screen. */
import { useState } from 'react';
import { View } from 'react-native';
import { ago, fmtDay, fmtT, inr, signedInr } from '../lib/format';
import {
  canDecide, isOverCeiling, levelOf, minutesWaiting, needsOwner, personById, redMessage, redRecipients, shiftCalc, shiftLabel, splitBilingual,
} from '../lib/rules';
import { useMe, useStore } from '../lib/store';
import type { Shift } from '../lib/types';
import { openWhatsApp } from '../lib/whatsapp';
import { Button, Card, Divider, IconBadge, NoteSheet, Pill, Row, Txt } from './kit';
import { C } from './theme';

export function ShiftStatusPill({ s }: { s: Shift }) {
  const data = useStore();
  if (s.status === 'open') return <Pill tone="info" label="In progress" />;
  if (s.status === 'green') return <Pill tone="ok" label="Green" />;
  const r = s.review;
  if (r?.status === 'accepted') return <Pill tone="warn" label={`Accepted · ${personById(data, r.by)?.name.split(' ')[0] ?? ''}`} />;
  if (r?.status === 'review') return <Pill tone="bad" label="Under review" />;
  return <Pill tone="bad" label="Waiting" />;
}

/** One shift as a row: works as a table row on laptops and a list row on phones. */
export function ShiftRow({ s, showDate, hideName }: { s: Shift; showDate?: boolean; hideName?: boolean }) {
  const data = useStore();
  const c = shiftCalc(s, data.cash.settings);
  const open = s.status === 'open';
  return (
    <Row style={{ paddingVertical: 12 }} gap={12}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt weight="600" numberOfLines={1}>{hideName ? shiftLabel(s) : personById(data, s.cashierId)?.name}</Txt>
        <Txt size={13} color={C.muted} numberOfLines={1}>
          {showDate ? fmtDay(s.date) + ' · ' : ''}{hideName ? '' : shiftLabel(s) + ' · '}{fmtT(s.openedAt)}{s.submittedAt ? '–' + fmtT(s.submittedAt) : ''}
        </Txt>
        {s.reason ? <Txt size={13} color={C.muted} numberOfLines={1}>{splitBilingual(s.reason)[0]}</Txt> : null}
        {!s.floatOk ? <Txt size={13} color={C.amber}>Float mismatch at start</Txt> : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Txt weight="700" color={open ? C.muted : c.red ? C.red : C.green}>{open ? '—' : signedInr(c.diff)}</Txt>
        <ShiftStatusPill s={s} />
      </View>
    </Row>
  );
}

export function ShiftList({ shifts, showDate, hideName, empty = 'No shifts yet.' }: { shifts: Shift[]; showDate?: boolean; hideName?: boolean; empty?: string }) {
  if (!shifts.length) return <Txt color={C.muted}>{empty}</Txt>;
  return (
    <View>
      {shifts.map((s, i) => (
        <View key={s.id}>
          {i > 0 ? <Divider /> : null}
          <ShiftRow s={s} showDate={showDate} hideName={hideName} />
        </View>
      ))}
    </View>
  );
}

/** A red shift waiting for a decision, with the one-tap actions. */
export function RedShiftItem({ s, compact }: { s: Shift; compact?: boolean }) {
  const data = useStore();
  const me = useMe()!;
  const { acceptRed, reviewRed, escalateRed } = useStore();
  const [sheet, setSheet] = useState<'accept' | 'review' | null>(null);
  const cs = data.cash.settings;
  const c = shiftCalc(s, cs);
  const cashier = personById(data, s.cashierId);
  const decide = canDecide(data, me, s);
  const isOwner = levelOf(me, data.roles) === 'owner';
  const toOwner = needsOwner(s, cs);
  const recipients = redRecipients(data, s).filter((p) => p.phone && p.id !== me.id);
  const tag = isOverCeiling(s, cs) ? `Above your ${inr(cs.ceiling)} limit` : s.review?.escalated ? 'Escalated to owner' : toOwner ? `No decision in ${cs.timeoutMin} min` : '';

  return (
    <View style={{ paddingVertical: 14 }}>
      <Row gap={14} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <IconBadge name="cash" tone="bad" />
        <View style={{ flex: 1, minWidth: 220 }}>
          <Txt weight="600">{s.counter} is {c.diff < 0 ? 'short' : 'over'} {inr(Math.abs(c.diff))}</Txt>
          <Txt size={13} color={C.muted}>
            {[tag, cashier?.name, `Reason: “${splitBilingual(s.reason)[0]}”`, s.submittedAt ? ago(s.submittedAt) : ''].filter(Boolean).join(' · ')}
          </Txt>
          {!compact ? <Txt size={13} color={C.muted}>Expected {inr(c.expected)} · counted {inr(c.counted)}</Txt> : null}
          {s.review?.status === 'review' ? (
            <Txt size={13} color={C.ink2}>Checking: “{s.review.note}” · {personById(data, s.review.by)?.name}</Txt>
          ) : null}
        </View>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {decide ? (
            <>
              <Button label="Review bills" kind="ghost" onPress={() => setSheet('review')} testID={`review-${s.id}`} />
              {!isOwner && !toOwner ? <Button label="Escalate" kind="danger" onPress={() => escalateRed(s.id)} /> : null}
              <Button label="Accept" kind="pri" onPress={() => setSheet('accept')} testID={`accept-${s.id}`} />
            </>
          ) : (
            <Txt size={13} color={C.muted}>Waiting for {redRecipients(data, s).map((p) => p.name.split(' ')[0]).join(' / ')} · {Math.round(minutesWaiting(s))} min</Txt>
          )}
          {recipients.length && !decide ? (
            <Button label="WhatsApp" kind="outline" icon="send" onPress={() => openWhatsApp(recipients[0].phone, redMessage(data, s))} />
          ) : null}
        </Row>
      </Row>
      <NoteSheet visible={sheet === 'accept'} title="Accept this variance" sub={`${s.counter} · ${cashier?.name} · ${signedInr(c.diff)}`} placeholder="Note (optional), e.g. checked bills" confirm="Accept"
        onClose={() => setSheet(null)} onConfirm={(n) => { acceptRed(s.id, n); setSheet(null); }} />
      <NoteSheet visible={sheet === 'review'} title="What are you checking?" sub="The shift stays open until someone accepts it." initial="Bills and voided-bill list" confirm="Mark under review"
        onClose={() => setSheet(null)} onConfirm={(n) => { reviewRed(s.id, n || 'Checking bills'); setSheet(null); }} />
    </View>
  );
}

export function RedShiftList({ shifts, compact }: { shifts: Shift[]; compact?: boolean }) {
  return (
    <Card pad={0} style={{ paddingHorizontal: 20 }}>
      {shifts.map((s, i) => (
        <View key={s.id}>
          {i > 0 ? <Divider /> : null}
          <RedShiftItem s={s} compact={compact} />
        </View>
      ))}
    </Card>
  );
}
