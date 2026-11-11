import { router, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isCashier, isWaiting, levelOf, seesCash, visibleIds } from '../lib/rules';
import { useMe, useStore } from '../lib/store';
import { Icon, type IconName } from './Icon';
import { Avatar, Txt, useWide } from './kit';
import { C } from './theme';

type NavItem = { href: '/' | '/cash' | '/settings'; label: string; icon: IconName; badge?: number };

function useNav(): NavItem[] {
  const me = useMe();
  const data = useStore();
  if (!me) return [];
  if (isCashier(me, data.roles)) return [{ href: '/cash', label: 'My counter', icon: 'cash' }];
  const vis = visibleIds(data, me);
  const waiting = data.cash.shifts.filter((s) => isWaiting(s) && vis.has(s.cashierId)).length;
  const items: NavItem[] = [{ href: '/', label: 'Home', icon: 'home' }];
  if (seesCash(data, me)) items.push({ href: '/cash', label: 'Cash', icon: 'cash', badge: waiting });
  if (levelOf(me, data.roles) === 'owner') items.push({ href: '/settings', label: 'Settings', icon: 'gear' });
  return items;
}

const active = (path: string, href: string) => (href === '/' ? path === '/' : path.startsWith(href));

export function Shell({ children }: { children: ReactNode }) {
  const wide = useWide();
  const nav = useNav();
  const path = usePathname();
  const me = useMe();
  const role = useStore((s) => s.roles.find((r) => r.id === me?.roleId)?.name ?? '');
  const signOut = useStore((s) => s.signOut);
  const insets = useSafeAreaInsets();

  if (wide) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: C.bg }}>
        <View style={st.side}>
          <View style={st.logo}>
            <View style={st.mark}><Txt size={14} weight="800" color="#fff">SB</Txt></View>
            <View><Txt weight="700">Sahara Bazaar</Txt><Txt size={12} color={C.muted}>Control Center</Txt></View>
          </View>
          {nav.map((n) => {
            const on = active(path, n.href);
            return (
              <Pressable key={n.href} onPress={() => router.navigate(n.href)} style={[st.navItem, on && { backgroundColor: C.greenSoft }]} accessibilityRole="link">
                <Icon name={n.icon} color={on ? C.green : C.ink2} />
                <Txt weight={on ? '600' : '500'} color={on ? C.green : C.ink2} style={{ flex: 1 }}>{n.label}</Txt>
                {n.badge ? <View style={st.count}><Txt size={12} weight="600" color="#fff">{n.badge}</Txt></View> : null}
              </Pressable>
            );
          })}
          <View style={{ flex: 1 }} />
          <View style={st.foot}>
            <Avatar name={me?.name ?? ''} />
            <View style={{ flex: 1 }}>
              <Txt size={14} weight="600" numberOfLines={1}>{me?.name}</Txt>
              <Txt size={12} color={C.muted}>{role}</Txt>
            </View>
            <Pressable accessibilityLabel="Lock" onPress={signOut} style={st.lockBtn}><Icon name="lock" size={18} /></Pressable>
          </View>
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1 }}>{children}</View>
      <View style={[st.tabs, { paddingBottom: 8 + insets.bottom }]}>
        {nav.length > 1 &&
          nav.map((n) => {
            const on = active(path, n.href);
            return (
              <Pressable key={n.href} onPress={() => router.navigate(n.href)} style={st.tab} accessibilityRole="link">
                <View>
                  <Icon name={n.icon} color={on ? C.green : C.muted} />
                  {n.badge ? <View style={st.dot} /> : null}
                </View>
                <Txt size={12} weight={on ? '600' : '500'} color={on ? C.green : C.muted}>{n.label}</Txt>
              </Pressable>
            );
          })}
        <Pressable onPress={signOut} style={st.tab} accessibilityRole="button" accessibilityLabel="Lock">
          <Icon name="lock" color={C.muted} />
          <Txt size={12} weight="500" color={C.muted}>Lock · लॉक</Txt>
        </Pressable>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  side: { width: 232, backgroundColor: C.card, borderRightWidth: 1, borderRightColor: C.line, paddingHorizontal: 16, paddingVertical: 24 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingBottom: 24 },
  mark: { width: 36, height: 36, borderRadius: 11, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12, marginBottom: 2 },
  count: { backgroundColor: C.red, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 1 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: C.bg },
  lockBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, justifyContent: 'space-around' },
  tab: { alignItems: 'center', gap: 3, minWidth: 72, paddingVertical: 2 },
  dot: { position: 'absolute', top: -2, right: -4, width: 9, height: 9, borderRadius: 5, backgroundColor: C.red, borderWidth: 2, borderColor: C.card },
});
