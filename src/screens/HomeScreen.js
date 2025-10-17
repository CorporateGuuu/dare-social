import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColor } from "../../hooks/use-theme-color";
import { ThemedView } from "../../components/themed-view";

export default function HomeScreen() {
  const textColor = useThemeColor({}, 'text');

  const styles = createStyles(textColor);

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
    </ThemedView>
  );
}

const createStyles = (textColor) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    color: textColor
  }
});
