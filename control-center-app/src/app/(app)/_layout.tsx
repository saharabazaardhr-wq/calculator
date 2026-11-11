import { Redirect, Stack } from 'expo-router';
import { useStore } from '../../lib/store';
import { Shell } from '../../ui/Shell';
import { C } from '../../ui/theme';

/** Everything inside (app) needs a signed-in person. */
export default function AppLayout() {
  const userId = useStore((s) => s.userId);
  if (!userId) return <Redirect href="/sign-in" />;
  return (
    <Shell>
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: C.bg } }} />
    </Shell>
  );
}
