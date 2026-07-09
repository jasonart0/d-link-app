import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import theme from '../constants/theme'

export default function StatusBadge({ status = 'neutral', style }) {
  const map = {
    buy: { bg: '#dffcff', color: '#005b6b' },
    sell: { bg: '#ffecec', color: '#7a0014' },
    neutral: { bg: '#eef5ff', color: '#00304d' },
    'no-trade': { bg: '#f4f6f8', color: '#6b7a87' }
  }
  const s = map[status] || map.neutral
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }, style]}>
      <Text style={[styles.text, { color: s.color }]}>{status.toUpperCase()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start'
  },
  text: { fontSize: 12, fontWeight: '700' }
})
