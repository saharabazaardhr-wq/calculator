/** The design system: every screen is built only from these pieces. */
import { type ReactNode, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type StyleProp, type TextStyle, type ViewStyle, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icon';
import { C, FONT, RADIUS, TONE, type Tone, WIDE } from './theme';

/* ---------- text ---------- */
type TxtProps = { testID?: string; children?: ReactNode; size?: number; weight?: '400' | '500' | '600' | '700' | '800'; color?: string; style?: StyleProp<TextStyle>; numberOfLines?: number; center?: boolean };
export function Txt({ testID, children, size = 15, weight = '400', color = C.ink, style, numberOfLines, center }: TxtProps) {
  return (
    <Text testID={testID} numberOfLines={numberOfLines} style={[{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, lineHeight: Math.round(size * 1.35), letterSpacing: size >= 24 ? -0.5 : 0 }, center && { textAlign: 'center' }, style]}>
      {children}
    </Text>
  );
}
/** Hindi line shown under an English label. */
export const Hi = ({ children, size = 13, color = C.muted, center }: { children: ReactNode; size?: number; color?: string; center?: boolean }) =>
  children ? <Txt size={size} color={color} center={center}>{children}</Txt> : null;

/* ---------- layout ---------- */
export function useWide() {
  return useWindowDimensions().width >= WIDE;
}

export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const wide = useWide();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: (wide ? 28 : 12) + insets.top, paddingHorizontal: wide ? 32 : 16, paddingBottom: footer ? 24 : 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ width: '100%', maxWidth: 1180, alignSelf: 'center' }}>{children}</View>
      </ScrollView>
      {footer ? (
        <View style={{ paddingHorizontal: wide ? 32 : 16, paddingTop: 12, paddingBottom: 16 + insets.bottom, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line }}>
          <View style={{ width: '100%', maxWidth: wide ? 560 : 1180, alignSelf: 'center' }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        {sub ? <Txt size={14} color={C.muted}>{sub}</Txt> : null}
        <Txt size={26} weight="700">{title}</Txt>
      </View>
      {right}
    </View>
  );
}

export function Card({ children, style, pad = 20 }: { children: ReactNode; style?: StyleProp<ViewStyle>; pad?: number }) {
  return <View style={[{ backgroundColor: C.card, borderRadius: RADIUS.card, padding: pad }, style]}>{children}</View>;
}

export function CardHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={[s.row, { marginBottom: 12 }]}>
      <Txt size={17} weight="600" style={{ flex: 1 }}>{title}</Txt>
      {right}
    </View>
  );
}

export const Row = ({ children, style, gap = 10 }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) => (
  <View style={[s.row, { gap }, style]}>{children}</View>
);

export const Divider = () => <View style={{ height: 1, backgroundColor: C.line }} />;

/** Lays children out in columns on wide screens, stacked on phones. */
export function Grid({ children, min = 160, gap = 12 }: { children: ReactNode; min?: number; gap?: number }) {
  const { width } = useWindowDimensions();
  const avail = Math.min(width, 1180) - (width >= WIDE ? 232 + 64 : 32);
  const cols = Math.max(1, Math.floor((avail + gap) / (min + gap)));
  const items = Array.isArray(children) ? children.filter(Boolean) : [children];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {items.map((c, i) => (
        <View key={i} style={{ width: `${100 / Math.min(cols, items.length)}%`, flexGrow: 1, flexBasis: min, maxWidth: cols === 1 ? '100%' : undefined }}>{c}</View>
      ))}
    </View>
  );
}

/* ---------- status ---------- */
export function Pill({ tone, label }: { tone: Tone; label: string }) {
  const t = TONE[tone];
  return (
    <View style={[s.pill, { backgroundColor: t.bg }]}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.fg }} />
      <Txt size={13} weight="500" color={t.fg}>{label}</Txt>
    </View>
  );
}

export function IconBadge({ name, tone, size = 44 }: { name: IconName; tone: Tone | 'dark'; size?: number }) {
  const t = tone === 'dark' ? { fg: '#fff', bg: C.ink } : TONE[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} color={t.fg} />
    </View>
  );
}

export function StatTile({ icon, tone, value, label, sub, subTone }: { icon: IconName; tone: Tone; value: string; label: string; sub?: string; subTone?: Tone }) {
  return (
    <Card pad={18} style={{ gap: 12, height: '100%' }}>
      <IconBadge name={icon} tone={tone} size={42} />
      <View>
        <Txt size={26} weight="700" color={tone === 'bad' && value !== '0' ? C.red : C.ink}>{value}</Txt>
        <Txt size={13} color={C.muted}>{label}</Txt>
        {sub ? <Txt size={13} weight="600" color={subTone ? TONE[subTone].fg : C.muted}>{sub}</Txt> : null}
      </View>
    </Card>
  );
}

/* ---------- buttons ---------- */
type BtnKind = 'pri' | 'ghost' | 'outline' | 'dark' | 'danger';
export function Button({ label, onPress, kind = 'outline', icon, disabled, testID }: { label: string; onPress: () => void; kind?: BtnKind; icon?: IconName; disabled?: boolean; testID?: string }) {
  const k = {
    pri: { bg: C.green, fg: '#fff', bd: C.green },
    ghost: { bg: C.bg, fg: C.ink, bd: C.bg },
    outline: { bg: C.card, fg: C.ink, bd: C.line },
    dark: { bg: C.ink, fg: '#fff', bd: C.ink },
    danger: { bg: C.card, fg: C.red, bd: C.line },
  }[kind];
  return (
    <Pressable testID={testID} accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: k.bg, borderColor: k.bd, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 }]}>
      {icon ? <Icon name={icon} size={16} color={k.fg} /> : null}
      <Txt size={14} weight="600" color={k.fg}>{label}</Txt>
    </Pressable>
  );
}

/** The one main action of a screen: big, full width, with an optional Hindi line. */
export function BigButton({ label, hi, onPress, tone = 'green', icon, disabled, testID }: { label: string; hi?: string; onPress: () => void; tone?: 'green' | 'red' | 'white'; icon?: IconName; disabled?: boolean; testID?: string }) {
  const bg = tone === 'red' ? C.red : tone === 'white' ? C.card : C.green;
  const fg = tone === 'white' ? C.ink : '#fff';
  return (
    <Pressable testID={testID} accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.big, { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1, borderWidth: tone === 'white' ? 1 : 0, borderColor: C.line }]}>
      {icon ? <Icon name={icon} color={fg} /> : null}
      <Txt size={17} weight="600" color={fg}>{label}</Txt>
      {hi ? <Txt size={14} color={tone === 'white' ? C.muted : 'rgba(255,255,255,0.8)'}>· {hi}</Txt> : null}
    </Pressable>
  );
}

/* ---------- inputs ---------- */
export function Stepper({ value, onChange, testID }: { value: number; onChange: (n: number) => void; testID?: string }) {
  return (
    <View style={s.stepper}>
      <Pressable accessibilityLabel="Less" onPress={() => onChange(Math.max(0, value - 1))} style={s.stepBtn}><Icon name="minus" color={C.green} size={22} /></Pressable>
      <TextInput testID={testID} value={value ? String(value) : ''} placeholder="0" placeholderTextColor={C.faint} keyboardType="number-pad" inputMode="numeric"
        onChangeText={(t) => onChange(Math.max(0, parseInt(t.replace(/\D/g, '') || '0', 10)))}
        style={[s.stepInput, { fontFamily: FONT }]} selectTextOnFocus />
      <Pressable accessibilityLabel="More" onPress={() => onChange(value + 1)} style={s.stepBtn}><Icon name="plus" color={C.green} size={22} /></Pressable>
    </View>
  );
}

export function MoneyField({ label, hi, value, onChange, testID, placeholder = '0' }: { label: string; hi?: string; value?: number; onChange: (n: number | undefined) => void; testID?: string; placeholder?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <View>
        <Txt size={14} weight="500" color={C.ink2}>{label}</Txt>
        <Hi>{hi}</Hi>
      </View>
      <View style={s.money}>
        <Txt size={17} color={C.muted}>₹</Txt>
        <TextInput testID={testID} value={value === undefined ? '' : String(value)} placeholder={placeholder} placeholderTextColor={C.faint}
          keyboardType="number-pad" inputMode="numeric" selectTextOnFocus
          onChangeText={(t) => { const d = t.replace(/\D/g, ''); onChange(d === '' ? undefined : parseInt(d, 10)); }}
          style={[{ flex: 1, fontSize: 18, fontWeight: '600', color: C.ink, paddingVertical: 0, fontFamily: FONT }]} />
      </View>
    </View>
  );
}

export function TextField({ value, onChange, placeholder, testID }: { value: string; onChange: (t: string) => void; placeholder?: string; testID?: string }) {
  return (
    <TextInput testID={testID} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.faint}
      style={[s.money, { fontSize: 16, color: C.ink, fontFamily: FONT }]} />
  );
}

/** Tap-to-choose options (reasons, counters). Nothing to type. */
export function Choices({ options, value, onChange, tone = 'green', cols = 2 }: { options: string[]; value: string; onChange: (v: string) => void; tone?: 'green' | 'red'; cols?: number }) {
  const on = tone === 'red' ? { bd: C.red, bg: C.redSoft } : { bd: C.green, bg: C.greenSoft };
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const [en, hi] = o.split(' / ');
        const sel = o === value;
        return (
          <Pressable key={o} accessibilityRole="radio" accessibilityState={{ selected: sel }} onPress={() => onChange(o)}
            style={[s.choice, { width: `${100 / cols - 2}%`, flexGrow: 1 }, sel && { borderColor: on.bd, backgroundColor: on.bg }]}>
            <Txt size={15} weight="500">{en}</Txt>
            {hi ? <Hi size={12}>{hi}</Hi> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function StepsBar({ total, done, redLast }: { total: number; done: number; redLast?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: redLast && i === total - 1 ? C.red : i < done ? C.green : i === done ? C.greenMid : '#DADADF' }} />
      ))}
    </View>
  );
}

/** Two-column label/value list (Expected / Counted …). */
export function KeyValues({ rows }: { rows: [string, string, string?][] }) {
  return (
    <Card pad={0} style={{ paddingHorizontal: 16 }}>
      {rows.map(([k, v, color], i) => (
        <View key={k} style={[s.kv, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
          <Txt color={C.muted}>{k}</Txt>
          <Txt weight="700" color={color ?? C.ink}>{v}</Txt>
        </View>
      ))}
    </Card>
  );
}

/* ---------- sheet (works on phone and web) ---------- */
export function NoteSheet({ visible, title, sub, placeholder, confirm, onConfirm, onClose, initial = '' }: { visible: boolean; title: string; sub?: string; placeholder?: string; confirm: string; onConfirm: (note: string) => void; onClose: () => void; initial?: string }) {
  const [note, setNote] = useState(initial);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.scrim} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => undefined}>
          <Txt size={19} weight="700">{title}</Txt>
          {sub ? <Txt color={C.muted} style={{ marginTop: 4 }}>{sub}</Txt> : null}
          <View style={{ marginVertical: 16 }}><TextField testID="sheet-note" value={note} onChange={setNote} placeholder={placeholder} /></View>
          <Row>
            <View style={{ flex: 1 }}><BigButton label="Cancel" tone="white" onPress={onClose} /></View>
            <View style={{ flex: 2 }}><BigButton testID="sheet-confirm" label={confirm} onPress={() => { onConfirm(note.trim()); setNote(''); }} /></View>
          </Row>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
      <IconBadge name="check" tone="ok" />
      <Txt color={C.muted}>{text}</Txt>
    </Card>
  );
}

export function Avatar({ name, color = C.green, size = 36 }: { name: string; color?: string; size?: number }) {
  const ini = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Txt size={size * 0.36} weight="600" color="#fff">{ini}</Txt>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, alignSelf: 'flex-start' },
  btn: { height: 44, paddingHorizontal: 16, borderRadius: RADIUS.sm, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  big: { minHeight: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: RADIUS.md },
  stepBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  stepInput: { width: 52, textAlign: 'center', fontSize: 19, fontWeight: '700', color: C.ink, paddingVertical: 0 },
  money: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderRadius: RADIUS.sm, paddingHorizontal: 14, height: 52, borderWidth: 1, borderColor: C.line },
  choice: { minHeight: 56, borderRadius: RADIUS.sm, backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1.5, borderColor: 'transparent', justifyContent: 'center' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 480, backgroundColor: C.bg, borderRadius: 24, padding: 22 },
});
