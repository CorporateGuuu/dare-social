import React from 'react';
import { Text } from 'react-native';
import { useThemeColor } from '../hooks/use-theme-color';

export function ThemedText({ style, ...props }) {
  const textColor = useThemeColor({}, 'text');

  return (
    <Text
      style={[{ color: textColor }, style]}
      {...props}
    />
  );
}
