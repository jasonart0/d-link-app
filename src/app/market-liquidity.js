import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { marketService } from '../services';

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

const getNestedValue = (sources, keys, fallback = '--') => {
  for (const source of sources) {
    const value = getValue(source, keys, null);

    if (value !== null) {
      return value;
    }
  }

  return fallback;
};

const formatList = (value) => {
  if (value === undefined || value === null || value === '') {
    return '--';
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return '--';
    }

    return value
      .map((item) => {
        if (item && typeof item === 'object') {
          return Object.entries(item)
            .map(([key, itemValue]) => `${key}: ${itemValue}`)
            .join(' · ');
        }

        return String(item);
      })
      .join('\n');
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, itemValue]) => `${key}: ${itemValue}`)
      .join('\n');
  }

  return String(value);
};

export default function MarketLiquidity() {
  const router = useRouter();
  const { isAuthenticated, isRestoring } = useAuth();
  const [liquidityZones, setLiquidityZones] = useState(null);
  const [latestCandle, setLatestCandle] = useState(null);
  const [timeframeAnalysis, setTimeframeAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadMarketData = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [zonesResponse, candleResponse, timeframeResponse] = await Promise.all([
        marketService.getLiquidityZones(),
        marketService.getLatestCandle(),
        marketService.getMultiTimeframeAnalysis(),
      ]);

      setLiquidityZones(zonesResponse);
      setLatestCandle(candleResponse);
      setTimeframeAnalysis(timeframeResponse);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load market liquidity analysis.');
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
      loadMarketData();
    }
  }, [isAuthenticated, loadMarketData]);

  const market = useMemo(() => {
    const sources = [latestCandle, liquidityZones, timeframeAnalysis];
    const candle = getValue(latestCandle, ['candle', 'latest_candle', 'latestCandle'], latestCandle);

    return {
      symbol: getNestedValue(sources, ['symbol', 'ticker', 'asset']),
      timeframe: getNestedValue(sources, ['timeframe', 'time_frame', 'interval']),
      candle,
      volume: getValue(candle, ['volume', 'vol']),
      buySideLiquidity: getValue(liquidityZones, [
        'buy_side_liquidity',
        'buySideLiquidity',
        'buy_liquidity',
      ]),
      sellSideLiquidity: getValue(liquidityZones, [
        'sell_side_liquidity',
        'sellSideLiquidity',
        'sell_liquidity',
      ]),
      supportZones: getValue(liquidityZones, ['support_zones', 'supportZones', 'support']),
      resistanceZones: getValue(liquidityZones, [
        'resistance_zones',
        'resistanceZones',
        'resistance',
      ]),
      recentSweep: getNestedValue(sources, ['recent_liquidity_sweep', 'recentLiquiditySweep', 'liquidity_sweep']),
      marketStructure: getNestedValue(sources, ['market_structure', 'marketStructure', 'structure']),
      trendStrength: getValue(timeframeAnalysis, ['trend_strength', 'trendStrength']),
      momentum: getValue(timeframeAnalysis, ['momentum']),
      volatilityStatus: getValue(timeframeAnalysis, ['volatility_status', 'volatilityStatus', 'volatility']),
      multiTimeframeBias: getValue(timeframeAnalysis, [
        'multi_timeframe_bias',
        'multiTimeframeBias',
        'timeframe_bias',
        'bias',
      ]),
      aiReasoning: getNestedValue(sources, [
        'chart_based_ai_reasoning',
        'chartBasedAiReasoning',
        'ai_reasoning',
        'reasoning',
      ]),
    };
  }, [latestCandle, liquidityZones, timeframeAnalysis]);

  const hasMarketData = Boolean(liquidityZones || latestCandle || timeframeAnalysis);

  if (isRestoring || !isAuthenticated || isLoading) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.neonBlue} size="large" />
        <Text style={styles.centerText}>
          {isAuthenticated ? 'Loading liquidity analysis' : 'Checking authentication'}
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
            onRefresh={() => loadMarketData({ refreshing: true })}
            tintColor={colors.neonBlue}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>D-LINE AI TRADING INTELLIGENCE</Text>
          <Text style={styles.title}>Market Liquidity</Text>
          <Text style={styles.subtitle}>Liquidity zones, candle behavior, and chart-based AI reasoning.</Text>
        </View>

        {error ? <ErrorState message={error} onRetry={loadMarketData} /> : null}

        {!hasMarketData && !error ? (
          <EmptyState
            title="No market analysis"
            info="Liquidity and chart behavior data will appear when the API returns analysis."
          />
        ) : (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.cardLabel}>Current Market</Text>
              <Text style={styles.symbol}>{market.symbol}</Text>
              <Text style={styles.timeframe}>{market.timeframe}</Text>
            </View>

            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>Latest Candle</Text>
              <View style={styles.candleGrid}>
                <Metric label="Open" value={getValue(market.candle, ['open', 'o'])} />
                <Metric label="High" value={getValue(market.candle, ['high', 'h'])} />
                <Metric label="Low" value={getValue(market.candle, ['low', 'l'])} />
                <Metric label="Close" value={getValue(market.candle, ['close', 'c'])} />
                <Metric label="Volume" value={market.volume} />
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>Liquidity Zones</Text>
              <DetailBlock label="Buy-side liquidity" value={formatList(market.buySideLiquidity)} />
              <DetailBlock label="Sell-side liquidity" value={formatList(market.sellSideLiquidity)} />
              <DetailBlock label="Support zones" value={formatList(market.supportZones)} />
              <DetailBlock label="Resistance zones" value={formatList(market.resistanceZones)} />
              <DetailBlock label="Recent liquidity sweep" value={formatList(market.recentSweep)} />
            </View>

            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>Chart Behavior</Text>
              <DetailBlock label="Market structure" value={formatList(market.marketStructure)} />
              <DetailBlock label="Trend strength" value={formatList(market.trendStrength)} />
              <DetailBlock label="Momentum" value={formatList(market.momentum)} />
              <DetailBlock label="Volatility status" value={formatList(market.volatilityStatus)} />
              <DetailBlock label="Multi-timeframe bias" value={formatList(market.multiTimeframeBias)} />
              <DetailBlock label="Chart-based AI reasoning" value={formatList(market.aiReasoning)} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{String(value)}</Text>
    </View>
  );
}

function DetailBlock({ label, value }) {
  return (
    <View style={styles.detailBlock}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value)}</Text>
    </View>
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
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  timeframe: {
    marginTop: spacing.xs,
    color: colors.neonBlue,
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  panel: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: 'rgba(11, 16, 32, 0.92)',
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  candleGrid: {
    gap: spacing.sm,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  detailBlock: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
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
    lineHeight: 22,
  },
});
