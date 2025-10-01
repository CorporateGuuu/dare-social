import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.hero} />
      <Text style={styles.title}>Welcome to Dare Social</Text>
      <Text style={styles.subtitle}>
        Create fun dares, earn Stone 🪨, and climb the leaderboard.
      </Text>

      <TouchableOpacity style={styles.btn} onPress={() => navigation.replace("Main")}>
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>

      <Text style={styles.note}>You start with 100 Stone.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" },
  hero: { height: 220, backgroundColor: "#eee", borderRadius: 12, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 14, color: "#555", marginTop: 8, marginBottom: 20 },
  btn: { backgroundColor: "#111", paddingVertical: 14, borderRadius: 10, marginTop: 4 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  note: { textAlign: "center", color: "#888", marginTop: 12 },
});
