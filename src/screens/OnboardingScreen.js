import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from '../../components/themed-view';
import { useThemeColor } from '../../hooks/use-theme-color';

export default function OnboardingScreen({ navigation }) {
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.hero, { backgroundColor: cardColor }]} />
      <Text style={[styles.title, { color: textColor }]}>Welcome to Dare Social</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        Create fun dares, earn Stone 🪨, and climb the leaderboard.
      </Text>

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("LoginScreen")}>
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>

      <Text style={[styles.note, { color: textColor }]}>You start with 100 Stone.</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  hero: { height: 220, borderRadius: 12, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 8, marginBottom: 20 },
  btn: { backgroundColor: "#111", paddingVertical: 14, borderRadius: 10, marginTop: 4 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  note: { textAlign: "center", marginTop: 12 },
});
