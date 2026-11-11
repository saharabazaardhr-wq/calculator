import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEMO_PINS } from '../lib/seed';
import { useStore } from '../lib/store';
import { Icon } from '../ui/Icon';
import { Avatar, Card, Hi, Txt } from '../ui/kit';
import { C } from '../ui/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'] as const;

export default function SignIn() {
  const userId = useStore((s) => s.userId);
  const allPeople = useStore((s) => s.people);
  const people = allPeople.filter((p) => p.active);
  const roles = useStore((s) => s.roles);
  const signIn = useStore((s) => s.signIn);
  const [who, setWho] = useState<string>('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();

  if (userId) return <Redirect href="/" />;
  const person = people.find((p) => p.id === who);

  const press = (k: (typeof KEYS)[number]) => {
    setError('');
    if (k === 'del') return setPin((p) => p.slice(0, -1));
    const next = k === 'ok' ? pin : (pin + k).slice(0, 4);
    setPin(next);
    if (next.length === 4 || k === 'ok') {
      if (!signIn(who, next)) {
        setError('Wrong PIN · गलत पिन');
        setPin('');
      }
    }
  };

  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={[st.wrap, { paddingTop: 32 + insets.top }]}>
      <View style={st.mark}><Txt size={18} weight="800" color="#fff">SB</Txt></View>
      <Txt size={28} weight="700" center>Control Center</Txt>
      <Txt color={C.muted} center style={{ marginBottom: 24 }}>Sahara Bazaar</Txt>

      {!person ? (
        <Card style={st.card}>
          <Txt size={19} weight="700">Who are you?</Txt>
          <Hi>आप कौन हैं?</Hi>
          <View style={{ marginTop: 14, gap: 8 }}>
            {people.map((p) => (
              <Pressable key={p.id} testID={`who-${p.id}`} onPress={() => setWho(p.id)} style={({ pressed }) => [st.person, pressed && { opacity: 0.7 }]}>
                <Avatar name={p.name} />
                <View style={{ flex: 1 }}>
                  <Txt weight="600">{p.name}</Txt>
                  <Txt size={13} color={C.muted}>{roles.find((r) => r.id === p.roleId)?.name}</Txt>
                </View>
                <Icon name="arrow" size={18} color={C.faint} />
              </Pressable>
            ))}
          </View>
        </Card>
      ) : (
        <Card style={st.card}>
          <Pressable onPress={() => { setWho(''); setPin(''); setError(''); }} style={st.back} accessibilityLabel="Back">
            <Icon name="back" />
          </Pressable>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Avatar name={person.name} size={56} />
            <Txt size={19} weight="700">{person.name}</Txt>
            <Txt color={C.muted}>Enter your 4-digit PIN · पिन डालें</Txt>
          </View>
          <View style={st.dots}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[st.dot, i < pin.length && { backgroundColor: C.green }]} />
            ))}
          </View>
          <Txt color={C.red} center style={{ minHeight: 20 }}>{error}</Txt>
          <View style={st.pad}>
            {KEYS.map((k) => (
              <Pressable key={k} testID={`key-${k}`} onPress={() => press(k)} style={({ pressed }) => [st.key, k === 'ok' && { backgroundColor: C.green }, pressed && { opacity: 0.6 }]}
                accessibilityLabel={k === 'del' ? 'Delete' : k === 'ok' ? 'Sign in' : k}>
                {k === 'del' ? <Icon name="delete" size={24} /> : k === 'ok' ? <Icon name="check" size={26} color="#fff" stroke={2.4} /> : <Txt size={26} weight="500">{k}</Txt>}
              </Pressable>
            ))}
          </View>
        </Card>
      )}
      <Txt size={13} color={C.faint} center style={{ marginTop: 18 }}>Demo PINs: {DEMO_PINS}</Txt>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  mark: { width: 56, height: 56, borderRadius: 17, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  card: { width: '100%', maxWidth: 420 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: C.bg },
  back: { position: 'absolute', left: 14, top: 14, width: 40, height: 40, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 20, marginBottom: 8 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: C.green },
  pad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  key: { width: '29%', height: 64, borderRadius: 18, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
});
