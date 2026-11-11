import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { C } from '../ui/theme';

export default function RootLayout() {
  const hydrated = useStore((s) => s.hydrated);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {hydrated ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }} />
      ) : (
        <View style={{ flex: 1, backgroundColor: C.bg }} />
      )}
    </SafeAreaProvider>
  );
}
