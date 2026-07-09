import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import theme from '../constants/theme'
import StatusBadge from './StatusBadge'

export default function PredictionCard({ symbol, confidence, risk, signal, entry, stop, target }) {
  const hasConfidence = confidence !== undefined && confidence !== null
  const hasRisk = risk !== undefined && risk !== null

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{symbol ?? '--'}</Text>
        {signal ? <StatusBadge status={signal} /> : null}
      </View>
      <View style={styles.scores}>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>AI Confidence</Text>
          <Text style={styles.scoreValue}>
            {confidence ?? '--'}{hasConfidence ? '%' : ''}
          </Text>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Risk</Text>
          <Text style={styles.scoreValue}>
            {risk ?? '--'}{hasRisk ? '%' : ''}
          </Text>
        </View>
      </View>
      <View style={styles.lines}>
        <View style={styles.line}><Text style={styles.lineLabel}>Entry</Text><Text style={styles.lineValue}>{entry ?? '--'}</Text></View>
        <View style={styles.line}><Text style={styles.lineLabel}>Stop</Text><Text style={styles.lineValue}>{stop ?? '--'}</Text></View>
        <View style={styles.line}><Text style={styles.lineLabel}>Target</Text><Text style={styles.lineValue}>{target ?? '--'}</Text></View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
    marginBottom: theme.spacing.md
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  symbol: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scores: { flexDirection: 'row', marginTop: theme.spacing.sm, justifyContent: 'space-between' },
  scoreBlock: { alignItems: 'center' },
  scoreLabel: { color: '#c8d7e6', fontSize: theme.typography.small },
  scoreValue: { color: theme.colors.accent, fontSize: theme.typography.h1, fontWeight: '900' },
  lines: { marginTop: theme.spacing.md, backgroundColor: 'rgba(255,255,255,0.03)', padding: theme.spacing.sm, borderRadius: theme.radii.sm },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  lineLabel: { color: '#c8d7e6' },
  lineValue: { color: '#fff', fontWeight: '700' }
})
