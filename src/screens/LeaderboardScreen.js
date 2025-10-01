import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>
      <View style={styles.topRow}>
        <View style={styles.card}><Text style={styles.rank}>🥈</Text></View>
        <View style={[styles.card, styles.centerCard]}><Text style={styles.rank}>🥇</Text></View>
        <View style={styles.card}><Text style={styles.rank}>🥉</Text></View>
      </View>
      <View style={styles.listCard}>
        <Text>4) @sam — 240 Stone</Text>
        <Text>5) @lee — 220 Stone</Text>
        <Text>...</Text>
      </View>
      <Text style={styles.lastPlace}>Last Place: @alex — 5 Stone (Do a dare!)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  card: { flex: 1, height: 88, backgroundColor: "#eee", margin: 4, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  centerCard: { transform: [{ translateY: -8 }] },
  rank: { fontSize: 28 },
  listCard: { marginTop: 16, backgroundColor: "#f4f4f4", padding: 12, borderRadius: 12 },
  lastPlace: { color: "#d00", marginTop: 12, fontWeight: "600" },
});
