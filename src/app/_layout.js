import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthNavigation />
    </AuthProvider>
  );
}

function AuthNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isRestoring } = useAuth();

  useEffect(() => {
    if (isRestoring) {
      return;
    }

    if (!isAuthenticated && pathname !== '/') {
      router.replace('/');
      return;
    }

    if (isAuthenticated && pathname === '/') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isRestoring, pathname, router]);

  if (isRestoring) {
    return <SessionLoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="latest-prediction" options={{ title: 'Latest Prediction' }} />
      <Stack.Screen name="market-liquidity" options={{ title: 'Market Liquidity' }} />
      <Stack.Screen name="news-sentiment" options={{ title: 'News Sentiment' }} />
      <Stack.Screen name="prediction-history" options={{ title: 'Prediction History' }} />
      <Stack.Screen name="training-monitor" options={{ title: 'Training Monitor' }} />
      <Stack.Screen name="model-statistics" options={{ title: 'Model Statistics' }} />
      <Stack.Screen name="risk-management" options={{ title: 'Risk Management' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}

function SessionLoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator color={colors.neonBlue} size="large" />
      <Text style={styles.loadingText}>Securing session</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 14,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
