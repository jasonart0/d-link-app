import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { predictionService, statsService, trainingService } from '../services';

const getValue = (source, keys, fallback = '--') => {
  if (!source) {
    return fallback;
  }

  for (const key of keys) {
    const value = source[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return fallback;
};

const formatPercent = (value) => {
  if (value === undefined || value === null || value === '') {
    return '--';
  }

  const stringValue = String(value);
  return stringValue.includes('%') ? stringValue : `${stringValue}%`;
};

const normalizeDirection = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isRestoring } = useAuth();
  const [latestSignal, setLatestSignal] = useState(null);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [action, setAction] = useState(null);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [signalResponse, trainingResponse, statsResponse] = await Promise.all([
        predictionService.getLatest(),
        trainingService.getStatus(),
        statsService.getModelStats(),
      ]);

      setLatestSignal(signalResponse);
      setTrainingStatus(trainingResponse);
      setModelStats(statsResponse);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isRestoring && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isRestoring, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, loadDashboard]);

  const summary = useMemo(
    () => ({
      direction: getValue(latestSignal, ['direction', 'signal', 'trade_direction', 'tradeDirection']),
      confidence: getValue(latestSignal, ['confidence', 'confidence_score', 'confidenceScore']),
      risk: getValue(latestSignal, ['risk', 'risk_score', 'riskScore']),
      marketBias: getValue(latestSignal, ['market_bias', 'marketBias', 'bias']),
      newsSentiment: getValue(latestSignal, ['news_sentiment', 'newsSentiment', 'sentiment']),
      liquidityStatus: getValue(latestSignal, [
        'liquidity_status',
        'liquidityStatus',
        'liquidity',
      ]),
      modelStatus: getValue(modelStats, ['status', 'model_status', 'modelStatus']),
      trainingStatus: getValue(trainingStatus, ['status', 'training_status', 'trainingStatus']),
      symbol: getValue(latestSignal, ['symbol', 'ticker', 'asset']),
      timeframe: getValue(latestSignal, ['timeframe', 'time_frame', 'interval']),
    }),
    [latestSignal, modelStats, trainingStatus],
  );

  const hasDashboardData = Boolean(latestSignal || trainingStatus || modelStats);

  const runPrediction = async () => {
    setAction('prediction');
    setError(null);

    try {
      const response = await predictionService.runPrediction();
      setLatestSignal(response);
    } catch (actionError) {
      setError(actionError?.message || 'Unable to run prediction.');
    } finally {
      setAction(null);
    }
  };

  const startTraining = async () => {
    setAction('training');
    setError(null);

    try {
      const response = await trainingService.startTraining();
      setTrainingStatus(response);
    } catch (actionError) {
      setError(actionError?.message || 'Unable to start training.');
    } finally {
      setAction(null);
    }
  };

  if (isRestoring || !isAuthenticated || isLoading) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.neonBlue} size="large" />
        <Text style={styles.centerText}>
          {isAuthenticated ? 'Loading trading intelligence' : 'Checking authentication'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadDashboard({ refreshing: true })}
            tintColor={colors.neonBlue}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>D-LINE AI TRADING INTELLIGENCE</Text>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Live model signal summary and platform readiness.</Text>
        </View>

        {error ? <ErrorState message={error} onRetry={loadDashboard} /> : null}

        {!hasDashboardData && !error ? (
          <EmptyState
            title="No signal data"
            info="Run a prediction or refresh when the API has trading intelligence available."
          />
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.cardLabel}>Latest AI Signal</Text>
                  <Text style={styles.symbol}>
                    {summary.symbol}
                    {summary.timeframe !== '--' ? ` · ${summary.timeframe}` : ''}
                  </Text>
                </View>
                <View style={[styles.directionBadge, styles[normalizeDirection(summary.direction)]]}>
                  <Text style={styles.directionText}>{summary.direction}</Text>
                </View>
              </View>

              <View style={styles.scoreGrid}>
                <ScoreTile label="Confidence" value={formatPercent(summary.confidence)} tone="blue" />
                <ScoreTile label="Risk" value={formatPercent(summary.risk)} tone="danger" />
              </View>
            </View>

            <View style={styles.grid}>
              <InsightTile label="Market Bias" value={summary.marketBias} />
              <InsightTile label="News Sentiment" value={summary.newsSentiment} />
              <InsightTile label="Liquidity Status" value={summary.liquidityStatus} />
              <InsightTile label="Model Status" value={summary.modelStatus} />
              <InsightTile label="Training Status" value={summary.trainingStatus} />
            </View>

            <View style={styles.actionsPanel}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <DashboardAction
                  label="Run Prediction"
                  loading={action === 'prediction'}
                  onPress={runPrediction}
                />
                <DashboardAction
                  label="Refresh Signal"
                  loading={isRefreshing}
                  onPress={() => loadDashboard({ refreshing: true })}
                />
                <DashboardAction
                  label="Start Training"
                  loading={action === 'training'}
                  onPress={startTraining}
                />
                <DashboardAction label="View History" onPress={() => router.push('/prediction-history')} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ScoreTile({ label, value, tone }) {
  return (
    <View style={styles.scoreTile}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, tone === 'danger' && styles.riskValue]}>{value}</Text>
    </View>
  );
}

function InsightTile({ label, value }) {
  return (
    <View style={styles.insightTile}>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={styles.insightValue}>{String(value)}</Text>
    </View>
  );
}

function DashboardAction({ label, loading, onPress }) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Text style={styles.actionText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 72,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  centerText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontWeight: '700',
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  eyebrow: {
    color: colors.neonGreen,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  heroCard: {
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  symbol: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  directionBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buy: {
    borderColor: 'rgba(41, 255, 154, 0.45)',
    backgroundColor: 'rgba(41, 255, 154, 0.12)',
  },
  sell: {
    borderColor: 'rgba(255, 77, 109, 0.45)',
    backgroundColor: 'rgba(255, 77, 109, 0.12)',
  },
  'no-trade': {
    borderColor: 'rgba(143, 163, 191, 0.45)',
    backgroundColor: 'rgba(143, 163, 191, 0.12)',
  },
  directionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreTile: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  scoreValue: {
    marginTop: spacing.xs,
    color: colors.neonBlue,
    fontSize: 28,
    fontWeight: '900',
  },
  riskValue: {
    color: colors.danger,
  },
  grid: {
    gap: spacing.md,
  },
  insightTile: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: 'rgba(17, 24, 39, 0.78)',
    padding: spacing.md,
  },
  insightLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  insightValue: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  actionsPanel: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  actionsGrid: {
    gap: spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.neonBlue,
  },
  actionPressed: {
    opacity: 0.78,
  },
  actionText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '900',
  },
});
