import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { StylyColors } from '@/constants/styly-theme';
import { AuthProvider, useAuth } from '@/state/auth-context';
import { OutfitsProvider } from '@/state/outfits-context';
import { ProfileProvider, useProfile } from '@/state/profile-context';
import { WardrobeProvider } from '@/state/wardrobe-context';
import '@/global.css';

const stylyTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: StylyColors.canvas, text: StylyColors.ink, primary: StylyColors.sage, border: StylyColors.line, card: StylyColors.surface } };

function AppNavigator() {
  const { loading, session } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  if (loading || (session && profileLoading)) return null;
  const onboardingCompleted = profile?.preferences.onboardingCompleted === true;

  return (
    <ThemeProvider value={stylyTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: StylyColors.canvas } }}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={Boolean(session) && !onboardingCompleted}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={Boolean(session) && onboardingCompleted}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="style-this" />
          <Stack.Screen name="outfits" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <WardrobeProvider>
          <OutfitsProvider>
            <AppNavigator />
          </OutfitsProvider>
        </WardrobeProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
