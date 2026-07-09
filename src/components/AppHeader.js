import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import theme from '../constants/theme'

export default function AppHeader({ title, onLeftPress, leftIcon, onRightPress, rightIcon, style }) {
  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity onPress={onLeftPress} style={styles.left}>
        {leftIcon ? leftIcon : <View style={styles.logoPlaceholder} />}
      </TouchableOpacity>
      <Text numberOfLines={1} style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onRightPress} style={styles.right}>
        {rightIcon ? rightIcon : <View style={{width:28}} />}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'transparent'
  },
  left: { width: 40, alignItems: 'flex-start' },
  right: { width: 40, alignItems: 'flex-end' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.h2,
    color: theme.colors.textPrimary,
    fontWeight: '600'
  },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.accent
  }
})
