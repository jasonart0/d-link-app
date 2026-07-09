import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import theme from '../constants/theme'
import ActionButton from './ActionButton'

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && <ActionButton title="Retry" onPress={onRetry} style={styles.button} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: theme.spacing.lg },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.danger },
  message: { marginTop: 8, color: theme.colors.textSecondary, textAlign: 'center' },
  button: { marginTop: 12 }
})
