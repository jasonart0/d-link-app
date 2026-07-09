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
import { predictionService } from '../services';

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

export default function LatestPrediction() {
  const router = useRouter();
  const { isAuthenticated, isRestoring } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const loadPrediction = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await predictionService.getLatest();
      setPrediction(response);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load latest prediction.');
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
      loadPrediction();
    }
  }, [isAuthenticated, loadPrediction]);

  const details = useMemo(
    () => [
      ['Symbol', getValue(prediction, ['symbol', 'ticker', 'asset'])],
      ['Timeframe', getValue(prediction, ['timeframe', 'time_frame', 'interval'])],
      ['Direction', getValue(prediction, ['direction', 'signal', 'trade_direction', 'tradeDirection'])],
      ['Entry Price', getValue(prediction, ['entry_price', 'entryPrice', 'entry'])],
      ['Stop Loss', getValue(prediction, ['stop_loss', 'stopLoss', 'stop'])],
      ['Target 1', getValue(prediction, ['target_1', 'target1', 'target_one'])],
      ['Target 2', getValue(prediction, ['target_2', 'target2', 'target_two'])],
      ['Target 3', getValue(prediction, ['target_3', 'target3', 'target_three'])],
      ['Confidence', formatPercent(getValue(prediction, ['confidence', 'confidence_score', 'confidenceScore'], null))],
      ['Risk', formatPercent(getValue(prediction, ['risk', 'risk_score', 'riskScore'], null))],
      ['Trade Quality Score', getValue(prediction, ['trade_quality_score', 'tradeQualityScore', 'quality_score'])],
      ['Expected Reward', getValue(prediction, ['expected_reward', 'expectedReward', 'reward'])],
      ['Market Bias', getValue(prediction, ['market_bias', 'marketBias', 'bias'])],
      [
        'Liquidity Reason',
        getValue(prediction, ['liquidity_reason', 'liquidityReason', 'liquidity_status_reason']),
      ],
      [
        'News Sentiment Reason',
        getValue(prediction, [
          'news_sentiment_reason',
          'newsSentimentReason',
          'sentiment_reason',
        ]),
      ],
      ['AI Explanation', getValue(prediction, ['ai_explanation', 'aiExplanation', 'explanation'])],
      ['Created Time', getValue(prediction, ['created_time', 'createdTime', 'created_at', 'createdAt'])],
    ],
    [prediction],
  );

  const runPrediction = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await predictionService.runPrediction();
      setPrediction(response);
    } catch (runError) {
      setError(runError?.message || 'Unable to run a new prediction.');
    } finally {
      setIsRunning(false);
    }
  };

  if (isRestoring || !isAuthenticated || isLoading) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.neonBlue} size="large" />
        <Text style={styles.centerText}>
          {isAuthenticated ? 'Loading latest prediction' : 'Checking authentication'}
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
            onRefresh={() => loadPrediction({ refreshing: true })}
            tintColor={colors.neonBlue}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>D-LINE AI TRADING INTELLIGENCE</Text>
          <Text style={styles.title}>Latest Prediction</Text>
          <Text style={styles.subtitle}>AI decision-support output from the prediction API.</Text>
        </View>

        {error ? <ErrorState message={error} onRetry={loadPrediction} /> : null}

        {!prediction && !error ? (
          <EmptyState
            title="No prediction available"
            info="Run a new prediction or refresh when the API has output ready."
          />
        ) : prediction ? (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>Signal Package</Text>
              <Text style={styles.symbol}>{details[0][1]}</Text>
              <Text style={styles.direction}>{details[2][1]}</Text>
              <View style={styles.scoreRow}>
                <Score label="Confidence" value={details[8][1]} />
                <Score label="Risk" value={details[9][1]} danger />
              </View>
            </View>

            <View style={styles.detailsPanel}>
              {details.map(([label, value]) => (
                <DetailRow key={label} label={label} value={value} />
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.buttonRow}>
          <PredictionButton
            label="Refresh"
            loading={isRefreshing}
            onPress={() => loadPrediction({ refreshing: true })}
          />
          <PredictionButton label="Run New Prediction" loading={isRunning} onPress={runPrediction} />
        </View>
      </ScrollView>
    </View>
  );
}

function Score({ label, value, danger }) {
  return (
    <View style={styles.scoreBox}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, danger && styles.dangerText]}>{value}</Text>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value)}</Text>
    </View>
  );
}

function PredictionButton({ label, loading, onPress }) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
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
  summaryCard: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  symbol: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  direction: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    color: colors.neonBlue,
    fontSize: 15,
    fontWeight: '900',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreBox: {
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
    fontSize: 24,
    fontWeight: '900',
  },
  dangerText: {
    color: colors.danger,
  },
  detailsPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: 'rgba(11, 16, 32, 0.92)',
    overflow: 'hidden',
  },
  detailRow: {
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.md,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  buttonRow: {
    gap: spacing.sm,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: colors.neonBlue,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  buttonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '900',
  },
});
