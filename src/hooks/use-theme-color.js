import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useThemeColor(props, colorName) {
  const { theme } = useContext(AuthContext) || { theme: 'light' };

  const colors = {
    light: {
      background: '#FFFFFF',
      card: '#F8F9FA',
      text: '#333333',
      accent: '#007AFF',
      border: '#E5E5E5',
    },
    dark: {
      background: '#000000',
      card: '#1A1A1A',
      text: '#FFFFFF',
      accent: '#00D4AA',
      border: '#333333',
    },
  };

  const themeColors = colors[theme] || colors.light;

  if (props[colorName]) {
    return props[colorName];
  }

  return themeColors[colorName] || themeColors.text;
}
