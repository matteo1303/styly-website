import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { StylyColors } from '@/constants/styly-theme';
import { DemoProvider } from '@/state/demo-context';
import '@/global.css';

const stylyTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: StylyColors.canvas, text: StylyColors.ink, primary: StylyColors.sage, border: StylyColors.line, card: StylyColors.surface } };

export default function RootLayout() {
  return (
    <DemoProvider>
      <ThemeProvider value={stylyTheme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: StylyColors.canvas } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="style-this" />
        </Stack>
      </ThemeProvider>
    </DemoProvider>
  );
}
