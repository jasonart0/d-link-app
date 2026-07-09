import { Stack } from 'expo-router';
import { colors } from '../constants/theme';

export default function RootLayout() {
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
