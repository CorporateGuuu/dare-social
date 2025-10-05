import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRealtimeLeaderboard } from "../../src/hooks/useRealtimeLeaderboard";

interface User {
  uid: string;
  rank: number;
  displayName: string;
  stoneBalance: number;
}

export default function LeaderboardScreen() {
  const { users, loading } = useRealtimeLeaderboard() as { users: User[]; loading: boolean };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const firstPlace = users[0];
  const lastPlace = users[users.length - 1];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboard (Live)</Text>

      {firstPlace && (
        <Text style={styles.first}>
          🏆 1st: {firstPlace.displayName} ({firstPlace.stoneBalance} Stone)
        </Text>
      )}

      {users.map((u) => (
        <Text key={u.uid} style={styles.item}>
          {u.rank}) {u.displayName} — {u.stoneBalance} Stone
        </Text>
      ))}

      {lastPlace && (
        <Text style={styles.last}>
          😬 Last Place: {lastPlace.displayName} ({lastPlace.stoneBalance} Stone)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  item: { fontSize: 14, marginVertical: 2 },
  first: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 10 },
  last: { marginTop: 20, fontWeight: "600", color: "#d00" },
});
