import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

export default ({ label, primary, dangerous, disabled, onPress, style }) => (
  <TouchableOpacity
    style={{
      padding: 16,
      borderRadius: 2,
      backgroundColor: disabled
        ? '#eee'
        : primary
          ? '#008800'
          : dangerous
            ? '#880000'
            : '#ddd',
      ...style
    }}
    onPress={onPress}
    disabled={disabled}
  >
    <Text
      style={{
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        color: disabled
          ? '#ccc'
          : primary || dangerous
            ? '#fff'
            : '#000'
      }}
    >
      {label.toUpperCase()}
    </Text>
  </TouchableOpacity>
)