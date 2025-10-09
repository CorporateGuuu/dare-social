import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";

export default function PlaceholderCard({ title = "Card", subtitle }) {
  const colorScheme = useColorScheme();
  const themeStyles = colorScheme === 'dark' ? darkStyles : styles;

  return (
    <View style={themeStyles.card}>
      <View style={themeStyles.media} />
      <Text style={themeStyles.title}>{title}</Text>
      {subtitle ? <Text style={themeStyles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#f4f4f4", borderRadius: 12, padding: 12, marginBottom: 12 },
  media: { height: 160, borderRadius: 8, backgroundColor: "#e9e9e9", marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4 },
});

// Dark mode styles
const darkStyles = StyleSheet.create({
  card: { backgroundColor: "#333", borderRadius: 12, padding: 12, marginBottom: 12 },
  media: { height: 160, borderRadius: 8, backgroundColor: "#555", marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "600", color: "#fff" },
  subtitle: { fontSize: 13, color: "#ccc", marginTop: 4 },
});
