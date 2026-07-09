import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import theme from '../constants/theme'

const items = [
  { key: 'home', label: 'Home' },
  { key: 'predict', label: 'Signals' },
  { key: 'history', label: 'History' },
  { key: 'settings', label: 'More' }
]

export default function BottomTabBar({ active = 'home', onSelect }) {
  return (
    <View style={styles.bar}>
      {items.map(i => (
        <TouchableOpacity key={i.key} style={styles.item} onPress={() => onSelect && onSelect(i.key)}>
          <View style={styles.iconPlaceholder} />
          <Text style={[styles.label, active === i.key && styles.active]}>{i.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: theme.colors.card, ...theme.shadows.subtle },
  item: { alignItems: 'center' },
  iconPlaceholder: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#e6eef5', marginBottom: 4 },
  label: { fontSize: 12, color: theme.colors.textSecondary },
  active: { color: theme.colors.primary, fontWeight: '700' }
})
