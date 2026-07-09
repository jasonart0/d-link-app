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
import { newsService } from '../services';

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

const firstNewsItem = (latestNews) => {
  if (Array.isArray(latestNews)) {
    return latestNews[0] ?? null;
  }

  if (Array.isArray(latestNews?.items)) {
    return latestNews.items[0] ?? null;
  }

  if (Array.isArray(latestNews?.news)) {
    return latestNews.news[0] ?? null;
  }

  if (Array.isArray(latestNews?.articles)) {
    return latestNews.articles[0] ?? null;
  }

  return latestNews;
};

const getNewsList = (latestNews) => {
  if (Array.isArray(latestNews)) {
    return latestNews;
  }

  return latestNews?.items || latestNews?.news || latestNews?.articles || [];
};

export default function NewsSentiment() {
  const router = useRouter();
  const { isAuthenticated, isRestoring } = useAuth();
  const [latestNews, setLatestNews] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadNews = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [latestResponse, sentimentResponse] = await Promise.all([
        newsService.getLatest(),
        newsService.getSentiment(),
      ]);

      setLatestNews(latestResponse);
      setSentiment(sentimentResponse);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load news sentiment analysis.');
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
      loadNews();
    }
  }, [isAuthenticated, loadNews]);

  const newsItem = useMemo(() => firstNewsItem(latestNews), [latestNews]);
  const newsList = useMemo(() => getNewsList(latestNews), [latestNews]);

  const summary = useMemo(
    () => ({
      title: getValue(newsItem, ['title', 'headline', 'summary']),
      symbol: getValue(newsItem, ['symbol', 'ticker', 'asset'], getValue(sentiment, ['symbol', 'ticker', 'asset'])),
      source: getValue(newsItem, ['source', 'publisher', 'provider']),
      time: getValue(newsItem, ['time', 'news_time', 'published_at', 'publishedAt', 'created_at']),
      sentiment: getValue(sentiment, ['sentiment', 'label', 'direction']),
      impactScore: getValue(sentiment, ['impact_score', 'impactScore', 'impact']),
      aiSummary: getValue(sentiment, ['ai_summary', 'aiSummary', 'summary']),
      expectedMarketEffect: getValue(sentiment, [
        'expected_market_effect',
        'expectedMarketEffect',
        'market_effect',
      ]),
      highImpactWarning: getValue(sentiment, [
        'high_impact_warning',
        'highImpactWarning',
        'warning',
      ], null),
    }),
    [newsItem, sentiment],
  );

  const hasNewsData = Boolean(newsItem || sentiment);

  if (isRestoring || !isAuthenticated || isLoading) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.neonBlue} size="large" />
        <Text style={styles.centerText}>
          {isAuthenticated ? 'Loading news sentiment' : 'Checking authentication'}
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
            onRefresh={() => loadNews({ refreshing: true })}
            tintColor={colors.neonBlue}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>D-LINE AI TRADING INTELLIGENCE</Text>
          <Text style={styles.title}>News Sentiment</Text>
          <Text style={styles.subtitle}>Decision-support news context for market awareness.</Text>
        </View>

        {error ? <ErrorState message={error} onRetry={loadNews} /> : null}

        {!hasNewsData && !error ? (
          <EmptyState
            title="No news sentiment"
            info="Market news and sentiment data will appear when the API returns analysis."
          />
        ) : (
          <>
            {summary.highImpactWarning ? (
              <View style={styles.warning}>
                <Text style={styles.warningLabel}>High impact warning</Text>
                <Text style={styles.warningText}>{String(summary.highImpactWarning)}</Text>
              </View>
            ) : null}

            <View style={styles.heroCard}>
              <Text style={styles.cardLabel}>Latest Market News</Text>
              <Text style={styles.headline}>{summary.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{summary.symbol}</Text>
                <Text style={styles.metaText}>{summary.source}</Text>
                <Text style={styles.metaText}>{summary.time}</Text>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>Sentiment Analysis</Text>
              <DetailBlock label="Sentiment" value={summary.sentiment} />
              <DetailBlock label="Impact score" value={summary.impactScore} />
              <DetailBlock label="AI summary" value={summary.aiSummary} />
              <DetailBlock label="Expected market effect" value={summary.expectedMarketEffect} />
            </View>

            {newsList.length > 1 ? (
              <View style={styles.panel}>
                <Text style={styles.sectionTitle}>Latest Market News</Text>
                {newsList.slice(0, 5).map((item, index) => (
                  <View key={`${getValue(item, ['title', 'headline'], 'news')}-${index}`} style={styles.newsItem}>
                    <Text style={styles.newsTitle}>{getValue(item, ['title', 'headline', 'summary'])}</Text>
                    <Text style={styles.newsMeta}>
                      {getValue(item, ['source', 'publisher', 'provider'])} ·{' '}
                      {getValue(item, ['time', 'news_time', 'published_at', 'publishedAt', 'created_at'])}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
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
  warning: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.55)',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 77, 109, 0.10)',
    padding: spacing.md,
  },
  warningLabel: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  warningText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  heroCard: {
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
  headline: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 30,
  },
  metaRow: {
    gap: spacing.xs,
  },
  metaText: {
    color: colors.neonBlue,
    fontSize: 14,
    fontWeight: '800',
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
  newsItem: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  newsTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  newsMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
